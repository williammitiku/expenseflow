import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { CategoryType } from '@expenseflow/shared';
import { BaseModel } from './base.model';
import { User } from './user.model';

@Table({ tableName: 'categories', underscored: true, paranoid: true })
export class Category extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare name: string;

  @Default(CategoryType.EXPENSE)
  @Column({ type: DataType.ENUM(...Object.values(CategoryType)), allowNull: false })
  declare type: CategoryType;

  @AllowNull(true)
  @Column(DataType.STRING(64))
  declare icon: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(32))
  declare color: string | null;

  @AllowNull(true)
  @Column({ type: DataType.UUID, field: 'parent_id' })
  declare parentId: string | null;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_system', allowNull: false })
  declare isSystem: boolean;

  @BelongsTo(() => User)
  declare user?: User;
}
