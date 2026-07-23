import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Table,
} from 'sequelize-typescript';
import { WalletType } from '@expenseflow/shared';
import { BaseModel } from './base.model';
import { User } from './user.model';
import { WalletMember } from './wallet-member.model';

@Table({ tableName: 'wallets', underscored: true, paranoid: true })
export class Wallet extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare name: string;

  @Default(WalletType.CASH)
  @Column({ type: DataType.ENUM(...Object.values(WalletType)), allowNull: false })
  declare type: WalletType;

  @Default('ETB')
  @Column({ type: DataType.CHAR(3), allowNull: false })
  declare currency: string;

  @Default(0)
  @Column({ type: DataType.DECIMAL(18, 2), allowNull: false })
  declare balance: string;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_shared', allowNull: false })
  declare isShared: boolean;

  @BelongsTo(() => User)
  declare user?: User;

  @HasMany(() => WalletMember)
  declare members?: WalletMember[];
}
