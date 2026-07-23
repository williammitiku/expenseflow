import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { User } from './user.model';
import { Wallet } from './wallet.model';

@Table({ tableName: 'goals', underscored: true, paranoid: true })
export class Goal extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare name: string;

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL(18, 2), field: 'target_amount' })
  declare targetAmount: string;

  @Default(0)
  @Column({ type: DataType.DECIMAL(18, 2), field: 'current_amount', allowNull: false })
  declare currentAmount: string;

  @Default('ETB')
  @Column({ type: DataType.CHAR(3), allowNull: false })
  declare currency: string;

  @AllowNull(true)
  @Column(DataType.DATEONLY)
  declare deadline: string | null;

  @ForeignKey(() => Wallet)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'wallet_id' })
  declare walletId: string | null;

  @BelongsTo(() => User)
  declare user?: User;

  @BelongsTo(() => Wallet)
  declare wallet?: Wallet;
}
