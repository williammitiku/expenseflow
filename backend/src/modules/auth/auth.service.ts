import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { SubscriptionPlan, SubscriptionStatus, UserRole } from '@expenseflow/shared';
import { User } from '../../database/models/user.model';
import { Session } from '../../database/models/session.model';
import { Subscription } from '../../database/models/subscription.model';
import { UsersRepository } from '../../database/repositories/users.repository';
import {
  generateRefreshToken,
  hashToken,
  parseDurationToMs,
  verifyTelegramAuth,
} from './auth.crypto';
import type { AuthResponse, JwtPayload } from './auth.types';
import type { DevLoginDto, TelegramLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectModel(Session) private readonly sessions: typeof Session,
    @InjectModel(Subscription) private readonly subscriptions: typeof Subscription,
  ) {}

  async loginWithTelegram(
    dto: TelegramLoginDto,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthResponse> {
    const botToken = this.config.get<string>('auth.telegramBotToken', '');
    if (!botToken) {
      throw new UnauthorizedException(
        'TELEGRAM_BOT_TOKEN is not configured. Use /auth/dev-login in development.',
      );
    }

    const valid = verifyTelegramAuth(
      {
        id: dto.id,
        first_name: dto.first_name,
        last_name: dto.last_name,
        username: dto.username,
        photo_url: dto.photo_url,
        auth_date: dto.auth_date,
        hash: dto.hash,
      },
      botToken,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid Telegram login payload');
    }

    const telegramId = String(dto.id);
    let user = await this.usersRepository.findByTelegramId(telegramId);

    if (!user) {
      user = await this.usersRepository.create({
        telegramId,
        firstName: dto.first_name || 'Telegram',
        lastName: dto.last_name ?? null,
        username: dto.username ?? null,
        avatarUrl: dto.photo_url ?? null,
        email: null,
        role: UserRole.USER,
        preferredCurrency: 'ETB',
        timezone: 'Africa/Addis_Ababa',
        settings: {},
      });
      await this.ensureFreeSubscription(user.id);
    } else {
      await user.update({
        firstName: dto.first_name || user.firstName,
        lastName: dto.last_name ?? user.lastName,
        username: dto.username ?? user.username,
        avatarUrl: dto.photo_url ?? user.avatarUrl,
      });
    }

    return this.issueAuthResponse(user, meta);
  }

  async devLogin(
    dto: DevLoginDto,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthResponse> {
    if (!this.config.get<boolean>('auth.allowDevLogin')) {
      throw new ForbiddenException('Dev login disabled in production');
    }

    const email = dto.email ?? 'demo@expenseflow.local';
    let user = await this.usersRepository.findByEmail(email);
    if (!user) {
      user = await this.usersRepository.create({
        firstName: 'Demo',
        lastName: 'User',
        username: 'demo',
        email,
        telegramId: null,
        avatarUrl: null,
        role: UserRole.USER,
        preferredCurrency: 'ETB',
        timezone: 'Africa/Addis_Ababa',
        settings: { darkMode: true },
      });
      await this.ensureFreeSubscription(user.id);
    }

    return this.issueAuthResponse(user, meta);
  }

  async refresh(
    refreshToken: string,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthResponse> {
    const tokenHash = hashToken(refreshToken);
    const session = await this.sessions.findOne({
      where: { refreshTokenHash: tokenHash },
    });

    if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Rotate refresh token
    await session.update({ revokedAt: new Date() });
    return this.issueAuthResponse(user, meta);
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    const tokenHash = hashToken(refreshToken);
    const session = await this.sessions.findOne({
      where: { refreshTokenHash: tokenHash },
    });
    if (session && !session.revokedAt) {
      await session.update({ revokedAt: new Date() });
    }
    return { success: true };
  }

  async logoutAll(userId: string): Promise<{ success: true }> {
    const sessions = await this.sessions.findAll({
      where: { userId, revokedAt: null },
    });
    await Promise.all(
      sessions.map((s) => s.update({ revokedAt: new Date() })),
    );
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.toPublicUser(user);
  }

  async validateAccessPayload(payload: JwtPayload): Promise<boolean> {
    if (payload.typ !== 'access' || !payload.sessionId) {
      return false;
    }
    const session = await this.sessions.findByPk(payload.sessionId);
    if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
      return false;
    }
    return session.userId === payload.sub;
  }

  private async issueAuthResponse(
    user: User,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthResponse> {
    const refreshTtl = this.config.get<string>('auth.jwtRefreshTtl', '30d');
    const accessTtl = this.config.get<string>('auth.jwtAccessTtl', '15m');
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + parseDurationToMs(refreshTtl));

    const session = await this.sessions.create({
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
      expiresAt,
      revokedAt: null,
    });

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      sessionId: session.id,
      typ: 'access',
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('auth.jwtAccessSecret'),
      expiresIn: accessTtl as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
      tokenType: 'Bearer',
      user: this.toPublicUser(user),
    };
  }

  private async ensureFreeSubscription(userId: string) {
    const existing = await this.subscriptions.findOne({ where: { userId } });
    if (!existing) {
      await this.subscriptions.create({
        userId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: null,
        providerRef: null,
      });
    }
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      preferredCurrency: user.preferredCurrency,
      timezone: user.timezone,
    };
  }
}
