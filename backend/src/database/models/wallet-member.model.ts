import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { WalletMemberRole } from '@expenseflow/shared';
import { BaseModel } from './base.model';
import { User } from './user.model';
import { Wallet } from './wallet.model';

@Table({ tableName: 'wallet_members', underscored: true, paranoid: true })
export class WalletMember extends BaseModel {
  @ForeignKey(() => Wallet)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'wallet_id' })
  declare walletId: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @Default(WalletMemberRole.VIEWER)
  @Column({
    type: DataType.ENUM(...Object.values(WalletMemberRole)),
    allowNull: false,
  })
  declare role: WalletMemberRole;

  @BelongsTo(() => Wallet)
  declare wallet?: Wallet;

  @BelongsTo(() => User)
  declare user?: User;
}
