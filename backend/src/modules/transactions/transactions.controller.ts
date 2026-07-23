import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TransactionType } from '@expenseflow/shared';
import type { Request } from 'express';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';
import type { AuthenticatedUser } from '../auth/auth.types';

class ListTransactionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  walletId?: string;

  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  to?: string;
}

function resolveUserId(
  req: Request & { user?: AuthenticatedUser; authVia?: string },
  explicit?: string,
): string {
  if (req.authVia === 'jwt' && req.user?.id) return req.user.id;
  if (explicit) return explicit;
  throw new UnauthorizedException('userId is required when using API key auth');
}

@ApiTags('transactions')
@ApiBearerAuth()
@ApiHeader({ name: 'x-internal-api-key', required: false })
@UseGuards(JwtOrApiKeyGuard)
@Controller({ path: 'transactions', version: '1' })
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create transaction (updates wallet balance)' })
  create(
    @Body() dto: CreateTransactionDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, dto.userId);
    return this.transactionsService.create({ ...dto, userId });
  }

  @Get()
  @ApiOperation({ summary: 'List transactions for a user' })
  findAll(
    @Query() query: ListTransactionsQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, query.userId);
    return this.transactionsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId') userIdQuery: string | undefined,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    return this.transactionsService.findOne(id, resolveUserId(req, userIdQuery));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId') userIdQuery: string | undefined,
    @Body() dto: UpdateTransactionDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, userIdQuery ?? dto.userId);
    return this.transactionsService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete transaction' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId') userIdQuery: string | undefined,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    return this.transactionsService.remove(id, resolveUserId(req, userIdQuery));
  }
}
