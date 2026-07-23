import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { RecurringFrequency } from '@expenseflow/shared';
import { BaseModel } from './base.model';
import { User } from './user.model';

@Table({ tableName: 'recurring_rules', underscored: true, paranoid: true })
export class RecurringRule extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare template: Record<string, unknown>;

  @Default(RecurringFrequency.MONTHLY)
  @Column({
    type: DataType.ENUM(...Object.values(RecurringFrequency)),
    allowNull: false,
  })
  declare frequency: RecurringFrequency;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'next_run_at' })
  declare nextRunAt: Date;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare active: boolean;

  @BelongsTo(() => User)
  declare user?: User;
}
