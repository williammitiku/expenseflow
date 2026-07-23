import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DEFAULT_CURRENCY, DEFAULT_TIMEZONE, UserRole } from '@expenseflow/shared';
import { UsersRepository } from '../../database/repositories/users.repository';
import { User } from '../../database/models/user.model';
import { buildPaginatedResponse } from '../../common/utils/pagination.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.assertUniqueConstraints(dto.email, dto.telegramId);

    return this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName ?? null,
      username: dto.username ?? null,
      email: dto.email ?? null,
      telegramId: dto.telegramId ?? null,
      avatarUrl: dto.avatarUrl ?? null,
      role: dto.role ?? UserRole.USER,
      preferredCurrency: dto.preferredCurrency ?? DEFAULT_CURRENCY,
      timezone: dto.timezone ?? DEFAULT_TIMEZONE,
      settings: dto.settings ?? {},
    });
  }

  async findAll(query: PaginationQueryDto) {
    const page = query.page;
    const limit = query.limit;
    const { rows, count } = await this.usersRepository.findPaginated({
      page,
      limit,
      q: query.q,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return buildPaginatedResponse(rows.map((u) => this.toPublic(u)), count, page, limit);
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.toPublic(user);
  }

  async findByTelegramId(telegramId: string) {
    const user = await this.usersRepository.findByTelegramId(telegramId);
    if (!user) {
      throw new NotFoundException(`User with telegramId ${telegramId} not found`);
    }
    return this.toPublic(user);
  }

  async upsertFromTelegram(input: {
    telegramId: string;
    firstName: string;
    lastName?: string;
    username?: string;
    avatarUrl?: string;
  }) {
    const existing = await this.usersRepository.findByTelegramId(input.telegramId);
    if (existing) {
      await existing.update({
        firstName: input.firstName || existing.firstName,
        lastName: input.lastName ?? existing.lastName,
        username: input.username ?? existing.username,
        avatarUrl: input.avatarUrl ?? existing.avatarUrl,
      });
      return this.toPublic(existing);
    }

    const created = await this.create({
      telegramId: input.telegramId,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      avatarUrl: input.avatarUrl,
    });
    return created;
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.usersRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`User ${id} not found`);
    }

    await this.assertUniqueConstraints(dto.email, dto.telegramId, id);

    const updated = await this.usersRepository.update(id, {
      ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
      ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
      ...(dto.username !== undefined ? { username: dto.username } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.telegramId !== undefined ? { telegramId: dto.telegramId } : {}),
      ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      ...(dto.role !== undefined ? { role: dto.role } : {}),
      ...(dto.preferredCurrency !== undefined
        ? { preferredCurrency: dto.preferredCurrency }
        : {}),
      ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      ...(dto.settings !== undefined ? { settings: dto.settings } : {}),
    });

    return this.toPublic(updated!);
  }

  async remove(id: string) {
    const deleted = await this.usersRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return { id, deleted: true };
  }

  private async assertUniqueConstraints(
    email?: string | null,
    telegramId?: string | null,
    excludeId?: string,
  ) {
    if (email) {
      const byEmail = await this.usersRepository.findByEmail(email);
      if (byEmail && byEmail.id !== excludeId) {
        throw new ConflictException('Email is already in use');
      }
    }

    if (telegramId) {
      const byTelegram = await this.usersRepository.findByTelegramId(telegramId);
      if (byTelegram && byTelegram.id !== excludeId) {
        throw new ConflictException('Telegram ID is already in use');
      }
    }
  }

  private toPublic(user: User) {
    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      preferredCurrency: user.preferredCurrency,
      timezone: user.timezone,
      settings: user.settings,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
