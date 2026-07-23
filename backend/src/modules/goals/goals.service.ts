import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TransactionType } from '@expenseflow/shared';
import { Goal } from '../../database/models/goal.model';
import { Wallet } from '../../database/models/wallet.model';
import { Transaction } from '../../database/models/transaction.model';
import { buildPaginatedResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { daysUntil } from '../budgets/budget.utils';
import {
  ContributeGoalDto,
  CreateGoalDto,
  UpdateGoalDto,
} from './dto/goal.dto';

export type GoalWithProgress = Record<string, unknown> & {
  remaining: string;
  percentComplete: number;
  isComplete: boolean;
  daysLeft: number | null;
};

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(Goal) private readonly goals: typeof Goal,
    @InjectModel(Wallet) private readonly wallets: typeof Wallet,
    @InjectModel(Transaction) private readonly transactions: typeof Transaction,
  ) {}

  async create(dto: CreateGoalDto & { userId: string }) {
    const row = await this.goals.create({
      userId: dto.userId,
      name: dto.name,
      targetAmount: Number(dto.targetAmount).toFixed(2),
      currentAmount: Number(dto.currentAmount ?? 0).toFixed(2),
      currency: dto.currency ?? 'ETB',
      deadline: dto.deadline ? dto.deadline.slice(0, 10) : null,
      walletId: dto.walletId ?? null,
    });
    return this.withProgress(row);
  }

  async findAll(userId: string, query: PaginationQueryDto) {
    const { rows, count } = await this.goals.findAndCountAll({
      where: { userId },
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      order: [[query.sortBy ?? 'createdAt', query.sortOrder ?? 'DESC']],
    });
    const data = rows.map((r) => this.withProgress(r));
    return buildPaginatedResponse(data, count, query.page, query.limit);
  }

  async findOne(id: string, userId: string) {
    const row = await this.goals.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException(`Goal ${id} not found`);
    return this.withProgress(row);
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    const row = await this.goals.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException(`Goal ${id} not found`);

    await row.update({
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.targetAmount !== undefined
        ? { targetAmount: Number(dto.targetAmount).toFixed(2) }
        : {}),
      ...(dto.currentAmount !== undefined
        ? { currentAmount: Number(dto.currentAmount).toFixed(2) }
        : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.deadline !== undefined
        ? { deadline: dto.deadline ? dto.deadline.slice(0, 10) : null }
        : {}),
      ...(dto.walletId !== undefined ? { walletId: dto.walletId } : {}),
    });

    return this.withProgress(row);
  }

  async contribute(id: string, userId: string, dto: ContributeGoalDto) {
    const amount = Number(dto.amount);
    if (!(amount > 0)) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const goal = await this.goals.findOne({ where: { id, userId } });
    if (!goal) throw new NotFoundException(`Goal ${id} not found`);

    const walletId = dto.walletId ?? goal.walletId;
    if (walletId) {
      const wallet = await this.wallets.findOne({
        where: { id: walletId, userId },
      });
      if (!wallet) throw new NotFoundException('Wallet not found for user');

      const balance = Number(wallet.balance);
      if (balance < amount) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      await wallet.update({ balance: (balance - amount).toFixed(2) });
      await this.transactions.create({
        userId,
        walletId: wallet.id,
        categoryId: null,
        type: TransactionType.EXPENSE,
        amount: amount.toFixed(2),
        currency: wallet.currency,
        merchant: `Goal: ${goal.name}`,
        note: 'Savings contribution',
        location: null,
        receiptImageKey: null,
        occurredAt: new Date(),
        transferWalletId: null,
        parentTransactionId: null,
        isRecurring: false,
        recurringRuleId: null,
        metadata: { source: 'goal-contribute', goalId: goal.id },
      });
    }

    const next = Math.min(Number(goal.currentAmount) + amount, Number(goal.targetAmount));
    await goal.update({ currentAmount: next.toFixed(2) });
    return this.withProgress(goal);
  }

  async remove(id: string, userId: string) {
    const row = await this.goals.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException(`Goal ${id} not found`);
    await row.destroy();
    return { deleted: true, id };
  }

  private withProgress(row: Goal): GoalWithProgress {
    const plain = row.get({ plain: true }) as Record<string, unknown>;
    const target = Number(row.targetAmount);
    const current = Number(row.currentAmount);
    const remaining = Math.max(target - current, 0);
    const percentComplete =
      target > 0 ? Math.round((current / target) * 1000) / 10 : 0;

    return {
      ...plain,
      remaining: remaining.toFixed(2),
      percentComplete,
      isComplete: current >= target && target > 0,
      daysLeft: daysUntil(row.deadline),
    };
  }
}
