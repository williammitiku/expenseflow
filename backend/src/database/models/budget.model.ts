import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BudgetPeriod } from '@expenseflow/shared';
import { BaseModel } from './base.model';
import { User } from './user.model';
import { Category } from './category.model';
import { Wallet } from './wallet.model';

@Table({ tableName: 'budgets', underscored: true, paranoid: true })
export class Budget extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare name: string;

  @Default(BudgetPeriod.MONTHLY)
  @Column({ type: DataType.ENUM(...Object.values(BudgetPeriod)), allowNull: false })
  declare period: BudgetPeriod;

  @AllowNull(false)
  @Column(DataType.DECIMAL(18, 2))
  declare amount: string;

  @Default('ETB')
  @Column({ type: DataType.CHAR(3), allowNull: false })
  declare currency: string;

  @ForeignKey(() => Category)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'category_id' })
  declare categoryId: string | null;

  @ForeignKey(() => Wallet)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'wallet_id' })
  declare walletId: string | null;

  @Default([50, 75, 90, 100])
  @Column({ type: DataType.JSONB, field: 'alert_thresholds', allowNull: false })
  declare alertThresholds: number[];

  @AllowNull(false)
  @Column({ type: DataType.DATEONLY, field: 'start_date' })
  declare startDate: string;

  @BelongsTo(() => User)
  declare user?: User;

  @BelongsTo(() => Category)
  declare category?: Category;

  @BelongsTo(() => Wallet)
  declare wallet?: Wallet;
}
