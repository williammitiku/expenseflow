import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TransactionType } from '@expenseflow/shared';
import { Transaction } from '../../database/models/transaction.model';
import { Wallet } from '../../database/models/wallet.model';
import { buildPaginatedResponse } from '../../common/utils/pagination.util';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction) private readonly transactions: typeof Transaction,
    @InjectModel(Wallet) private readonly wallets: typeof Wallet,
  ) {}

  async create(dto: CreateTransactionDto & { userId: string }) {
    const wallet = await this.wallets.findOne({
      where: { id: dto.walletId, userId: dto.userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found for user');
    }

    const amount = Number(dto.amount);
    if (!(amount > 0)) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const tx = await this.transactions.create({
      userId: dto.userId,
      walletId: dto.walletId,
      categoryId: dto.categoryId ?? null,
      type: dto.type,
      amount: dto.amount,
      currency: dto.currency ?? wallet.currency,
      merchant: dto.merchant ?? null,
      note: dto.note ?? null,
      location: dto.location ?? null,
      receiptImageKey: dto.receiptImageKey ?? null,
      occurredAt: new Date(dto.occurredAt),
      transferWalletId: dto.transferWalletId ?? null,
      parentTransactionId: dto.parentTransactionId ?? null,
      isRecurring: dto.isRecurring ?? false,
      recurringRuleId: dto.recurringRuleId ?? null,
      metadata: dto.metadata ?? {},
    });

    await this.applyBalanceDelta(wallet, dto.type, amount);

    return this.toPublic(tx);
  }

  async findAll(
    userId: string,
    query: PaginationQueryDto & {
      walletId?: string;
      type?: TransactionType;
      from?: string;
      to?: string;
    },
  ) {
    const where: Record<string, unknown> = { userId };
    if (query.walletId) where.walletId = query.walletId;
    if (query.type) where.type = query.type;
    if (query.from || query.to) {
      where.occurredAt = {
        ...(query.from ? { [Op.gte]: new Date(query.from) } : {}),
        ...(query.to ? { [Op.lte]: new Date(query.to) } : {}),
      };
    }
    if (query.q) {
      where[Op.or as unknown as string] = [
        { merchant: { [Op.iLike]: `%${query.q}%` } },
        { note: { [Op.iLike]: `%${query.q}%` } },
      ];
    }

    const { rows, count } = await this.transactions.findAndCountAll({
      where: where as never,
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      order: [[query.sortBy ?? 'occurredAt', query.sortOrder ?? 'DESC']],
    });

    return buildPaginatedResponse(
      rows.map((r) => this.toPublic(r)),
      count,
      query.page,
      query.limit,
    );
  }

  async findOne(id: string, userId: string) {
    const tx = await this.transactions.findOne({ where: { id, userId } });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
    return this.toPublic(tx);
  }

  async update(id: string, userId: string, dto: UpdateTransactionDto) {
    const tx = await this.transactions.findOne({ where: { id, userId } });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);

    // Revert old balance, apply new (simple approach)
    const wallet = await this.wallets.findByPk(tx.walletId);
    if (wallet) {
      await this.applyBalanceDelta(wallet, tx.type, -Number(tx.amount));
    }

    const nextType = dto.type ?? tx.type;
    const nextAmount = dto.amount ? Number(dto.amount) : Number(tx.amount);
    const nextWalletId = dto.walletId ?? tx.walletId;

    await tx.update({
      ...(dto.walletId !== undefined ? { walletId: dto.walletId } : {}),
      ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
      ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      ...(dto.merchant !== undefined ? { merchant: dto.merchant } : {}),
      ...(dto.note !== undefined ? { note: dto.note } : {}),
      ...(dto.location !== undefined ? { location: dto.location } : {}),
      ...(dto.receiptImageKey !== undefined
        ? { receiptImageKey: dto.receiptImageKey }
        : {}),
      ...(dto.occurredAt !== undefined
        ? { occurredAt: new Date(dto.occurredAt) }
        : {}),
      ...(dto.transferWalletId !== undefined
        ? { transferWalletId: dto.transferWalletId }
        : {}),
      ...(dto.metadata !== undefined ? { metadata: dto.metadata } : {}),
    });

    const nextWallet =
      (await this.wallets.findOne({
        where: { id: nextWalletId, userId },
      })) ?? null;
    if (nextWallet) {
      await this.applyBalanceDelta(nextWallet, nextType, nextAmount);
    }

    return this.toPublic(tx);
  }

  async remove(id: string, userId: string) {
    const tx = await this.transactions.findOne({ where: { id, userId } });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);

    const wallet = await this.wallets.findByPk(tx.walletId);
    if (wallet) {
      await this.applyBalanceDelta(wallet, tx.type, -Number(tx.amount));
    }

    await tx.destroy();
    return { id, deleted: true };
  }

  private async applyBalanceDelta(
    wallet: Wallet,
    type: TransactionType,
    signedAmount: number,
  ) {
    const current = Number(wallet.balance);
    let next = current;
    if (type === TransactionType.EXPENSE || type === TransactionType.TRANSFER) {
      next = current - signedAmount;
    } else if (type === TransactionType.INCOME || type === TransactionType.REFUND) {
      next = current + signedAmount;
    }
    await wallet.update({ balance: next.toFixed(2) });
  }

  private toPublic(tx: Transaction) {
    return {
      id: tx.id,
      userId: tx.userId,
      walletId: tx.walletId,
      categoryId: tx.categoryId,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      merchant: tx.merchant,
      note: tx.note,
      location: tx.location,
      receiptImageKey: tx.receiptImageKey,
      occurredAt: tx.occurredAt,
      transferWalletId: tx.transferWalletId,
      parentTransactionId: tx.parentTransactionId,
      isRecurring: tx.isRecurring,
      recurringRuleId: tx.recurringRuleId,
      metadata: tx.metadata,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }
}
