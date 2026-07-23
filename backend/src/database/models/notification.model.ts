import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { NotificationChannel } from '@expenseflow/shared';
import { BaseModel } from './base.model';
import { User } from './user.model';

@Table({ tableName: 'notifications', underscored: true, paranoid: true })
export class Notification extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @Default(NotificationChannel.IN_APP)
  @Column({
    type: DataType.ENUM(...Object.values(NotificationChannel)),
    allowNull: false,
  })
  declare channel: NotificationChannel;

  @AllowNull(false)
  @Column(DataType.STRING(64))
  declare type: string;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare payload: Record<string, unknown>;

  @Default('pending')
  @Column({
    type: DataType.ENUM('pending', 'sent', 'failed'),
    allowNull: false,
  })
  declare status: 'pending' | 'sent' | 'failed';

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'sent_at' })
  declare sentAt: Date | null;

  @BelongsTo(() => User)
  declare user?: User;
}
