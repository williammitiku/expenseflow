import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { UserRole } from '@expenseflow/shared';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import type { AuthenticatedUser } from '../auth/auth.types';

@ApiTags('users')
@ApiBearerAuth()
@ApiHeader({ name: 'x-internal-api-key', required: false })
@UseGuards(JwtOrApiKeyGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user (API key or admin)' })
  create(
    @Body() dto: CreateUserDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    this.assertAdminOrApiKey(req);
    return this.usersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List users (API key or admin)' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    this.assertAdminOrApiKey(req);
    return this.usersService.findAll(query);
  }

  @Get('telegram/:telegramId')
  @ApiOperation({ summary: 'Get user by Telegram id (internal)' })
  findByTelegram(
    @Param('telegramId') telegramId: string,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    this.assertAdminOrApiKey(req);
    return this.usersService.findByTelegramId(telegramId);
  }

  @Post('telegram/upsert')
  @ApiOperation({ summary: 'Create or update user from Telegram profile (internal)' })
  upsertTelegram(
    @Body()
    body: {
      telegramId: string;
      firstName: string;
      lastName?: string;
      username?: string;
      avatarUrl?: string;
    },
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    this.assertAdminOrApiKey(req);
    return this.usersService.upsertFromTelegram(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    if (req.authVia === 'jwt' && req.user && req.user.id !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot view other users');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    if (req.authVia === 'jwt' && req.user && req.user.id !== id && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Cannot update other users');
    }
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user (API key or admin)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    this.assertAdminOrApiKey(req);
    return this.usersService.remove(id);
  }

  private assertAdminOrApiKey(
    req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    if (req.authVia === 'api-key') return;
    if (req.authVia === 'jwt' && req.user?.role === UserRole.ADMIN) return;
    throw new ForbiddenException('Admin or internal API key required');
  }
}
