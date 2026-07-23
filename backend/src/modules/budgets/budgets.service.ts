import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BudgetPeriod, TransactionType } from '@expenseflow/shared';
import { Budget } from '../../database/models/budget.model';
import { Transaction } from '../../database/models/transaction.model';
import { buildPaginatedResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { budgetPeriodRange, budgetStatus } from './budget.utils';

export type BudgetWithProgress = Record<string, unknown> & {
  spent: string;
  remaining: string;
  percentUsed: number;
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
  periodFrom: string;
  periodTo: string;
};

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget) private readonly budgets: typeof Budget,
    @InjectModel(Transaction) private readonly transactions: typeof Transaction,
  ) {}

  async create(dto: CreateBudgetDto & { userId: string }) {
    const row = await this.budgets.create({
      userId: dto.userId,
      name: dto.name,
      period: dto.period ?? BudgetPeriod.MONTHLY,
      amount: Number(dto.amount).toFixed(2),
      currency: dto.currency ?? 'ETB',
      categoryId: dto.categoryId ?? null,
      walletId: dto.walletId ?? null,
      alertThresholds: dto.alertThresholds ?? [50, 75, 90, 100],
      startDate: dto.startDate.slice(0, 10),
    });
    return this.withProgress(row);
  }

  async findAll(userId: string, query: PaginationQueryDto) {
    const { rows, count } = await this.budgets.findAndCountAll({
      where: { userId },
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      order: [[query.sortBy ?? 'createdAt', query.sortOrder ?? 'DESC']],
    });
    const data = await Promise.all(rows.map((r) => this.withProgress(r)));
    return buildPaginatedResponse(data, count, query.page, query.limit);
  }

  async findOne(id: string, userId: string) {
    const row = await this.budgets.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException(`Budget ${id} not found`);
    return this.withProgress(row);
  }

  async update(id: string, userId: string, dto: UpdateBudgetDto) {
    const row = await this.budgets.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException(`Budget ${id} not found`);

    await row.update({
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.period !== undefined ? { period: dto.period } : {}),
      ...(dto.amount !== undefined ? { amount: Number(dto.amount).toFixed(2) } : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
      ...(dto.walletId !== undefined ? { walletId: dto.walletId } : {}),
      ...(dto.alertThresholds !== undefined
        ? { alertThresholds: dto.alertThresholds }
        : {}),
      ...(dto.startDate !== undefined ? { startDate: dto.startDate.slice(0, 10) } : {}),
    });

    return this.withProgress(row);
  }

  async remove(id: string, userId: string) {
    const row = await this.budgets.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException(`Budget ${id} not found`);
    await row.destroy();
    return { deleted: true, id };
  }

  private async withProgress(row: Budget): Promise<BudgetWithProgress> {
    const plain = row.get({ plain: true }) as Record<string, unknown>;
    const amount = Number(row.amount);
    if (!(amount > 0)) {
      throw new BadRequestException('Budget amount must be positive');
    }

    const { from, to } = budgetPeriodRange(row.period, row.startDate);
    const where: Record<string, unknown> = {
      userId: row.userId,
      type: TransactionType.EXPENSE,
      occurredAt: { [Op.gte]: from, [Op.lte]: to },
    };
    if (row.categoryId) where.categoryId = row.categoryId;
    if (row.walletId) where.walletId = row.walletId;

    const txs = await this.transactions.findAll({
      where: where as never,
      attributes: ['amount'],
    });
    const spent = txs.reduce((sum, t) => sum + Number(t.amount), 0);
    const remaining = Math.max(amount - spent, 0);
    const percentUsed = Math.round((spent / amount) * 1000) / 10;
    const status = budgetStatus(percentUsed, row.alertThresholds ?? [50, 75, 90, 100]);

    return {
      ...plain,
      spent: spent.toFixed(2),
      remaining: remaining.toFixed(2),
      percentUsed,
      status,
      periodFrom: from.toISOString(),
      periodTo: to.toISOString(),
    };
  }
}
