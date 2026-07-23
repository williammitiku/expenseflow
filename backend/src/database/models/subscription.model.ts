import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { SubscriptionPlan, SubscriptionStatus } from '@expenseflow/shared';
import { BaseModel } from './base.model';
import { User } from './user.model';

@Table({ tableName: 'subscriptions', underscored: true, paranoid: true })
export class Subscription extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id', unique: true })
  declare userId: string;

  @Default(SubscriptionPlan.FREE)
  @Column({
    type: DataType.ENUM(...Object.values(SubscriptionPlan)),
    allowNull: false,
  })
  declare plan: SubscriptionPlan;

  @Default(SubscriptionStatus.ACTIVE)
  @Column({
    type: DataType.ENUM(...Object.values(SubscriptionStatus)),
    allowNull: false,
  })
  declare status: SubscriptionStatus;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'current_period_end' })
  declare currentPeriodEnd: Date | null;

  @AllowNull(true)
  @Column({ type: DataType.STRING(255), field: 'provider_ref' })
  declare providerRef: string | null;

  @BelongsTo(() => User)
  declare user?: User;
}
