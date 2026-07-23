import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import type { AuthenticatedUser, JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        config.get<string>('auth.jwtAccessSecret') ??
        'dev_access_secret_change_me_32chars',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const ok = await this.authService.validateAccessPayload(payload);
    if (!ok) {
      throw new UnauthorizedException('Invalid or revoked session');
    }
    return {
      id: payload.sub,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
