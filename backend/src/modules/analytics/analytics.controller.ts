import {
  Controller,
  Get,
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
import { InjectModel } from '@nestjs/sequelize';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { Op } from 'sequelize';
import type { Request } from 'express';
import { TransactionType } from '@expenseflow/shared';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { Transaction } from '../../database/models/transaction.model';
import { Wallet } from '../../database/models/wallet.model';
import type { AuthenticatedUser } from '../auth/auth.types';

class SummaryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: ['day', 'week', 'month', 'year'] })
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year'])
  period?: 'day' | 'week' | 'month' | 'year' = 'month';
}

function resolveUserId(
  req: Request & { user?: AuthenticatedUser; authVia?: string },
  explicit?: string,
): string {
  if (req.authVia === 'jwt' && req.user?.id) return req.user.id;
  if (explicit) return explicit;
  throw new UnauthorizedException('userId is required when using API key auth');
}

function periodStart(period: 'day' | 'week' | 'month' | 'year'): Date {
  const now = new Date();
  const start = new Date(now);
  if (period === 'day') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }
  return start;
}

@ApiTags('analytics')
@ApiBearerAuth()
@ApiHeader({ name: 'x-internal-api-key', required: false })
@UseGuards(JwtOrApiKeyGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(
    @InjectModel(Transaction) private readonly transactions: typeof Transaction,
    @InjectModel(Wallet) private readonly wallets: typeof Wallet,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Spending / income summary for a period' })
  async summary(
    @Query() query: SummaryQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, query.userId);
    const period = query.period ?? 'month';
    const from = periodStart(period);

    const rows = await this.transactions.findAll({
      where: {
        userId,
        occurredAt: { [Op.gte]: from },
      },
      order: [['occurredAt', 'DESC']],
      limit: 500,
    });

    let expenseTotal = 0;
    let incomeTotal = 0;
    const byMerchant = new Map<string, number>();
    const currency = rows[0]?.currency ?? 'ETB';

    for (const row of rows) {
      const amount = Number(row.amount);
      if (row.type === TransactionType.EXPENSE || row.type === TransactionType.TRANSFER) {
        expenseTotal += amount;
        const key = row.merchant || 'Other';
        byMerchant.set(key, (byMerchant.get(key) ?? 0) + amount);
      } else if (
        row.type === TransactionType.INCOME ||
        row.type === TransactionType.REFUND
      ) {
        incomeTotal += amount;
      }
    }

    const topMerchants = [...byMerchant.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([merchant, total]) => ({
        merchant,
        total: total.toFixed(2),
      }));

    const wallets = await this.wallets.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });

    return {
      period,
      from: from.toISOString(),
      to: new Date().toISOString(),
      currency,
      expenseTotal: expenseTotal.toFixed(2),
      incomeTotal: incomeTotal.toFixed(2),
      net: (incomeTotal - expenseTotal).toFixed(2),
      transactionCount: rows.length,
      topMerchants,
      recent: rows.slice(0, 8).map((r) => ({
        id: r.id,
        type: r.type,
        amount: r.amount,
        currency: r.currency,
        merchant: r.merchant,
        occurredAt: r.occurredAt,
      })),
      wallets: wallets.map((w) => ({
        id: w.id,
        name: w.name,
        type: w.type,
        currency: w.currency,
        balance: w.balance,
      })),
    };
  }
}
