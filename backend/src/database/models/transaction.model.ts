import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { TransactionType } from '@expenseflow/shared';
import { BaseModel } from './base.model';
import { User } from './user.model';
import { Wallet } from './wallet.model';
import { Category } from './category.model';
import { RecurringRule } from './recurring-rule.model';

@Table({ tableName: 'transactions', underscored: true, paranoid: true })
export class Transaction extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @ForeignKey(() => Wallet)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'wallet_id' })
  declare walletId: string;

  @ForeignKey(() => Category)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'category_id' })
  declare categoryId: string | null;

  @AllowNull(false)
  @Column({ type: DataType.ENUM(...Object.values(TransactionType)) })
  declare type: TransactionType;

  @AllowNull(false)
  @Column(DataType.DECIMAL(18, 2))
  declare amount: string;

  @Default('ETB')
  @Column({ type: DataType.CHAR(3), allowNull: false })
  declare currency: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare merchant: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare note: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare location: string | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(512), field: 'receipt_image_key' })
  declare receiptImageKey: string | null;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'occurred_at' })
  declare occurredAt: Date;

  @ForeignKey(() => Wallet)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'transfer_wallet_id' })
  declare transferWalletId: string | null;

  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'parent_transaction_id' })
  declare parentTransactionId: string | null;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_recurring', allowNull: false })
  declare isRecurring: boolean;

  @ForeignKey(() => RecurringRule)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'recurring_rule_id' })
  declare recurringRuleId: string | null;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare metadata: Record<string, unknown>;

  @BelongsTo(() => User)
  declare user?: User;

  @BelongsTo(() => Wallet)
  declare wallet?: Wallet;

  @BelongsTo(() => Category)
  declare category?: Category;
}
