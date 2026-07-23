import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { User } from './user.model';

@Table({ tableName: 'tags', underscored: true, paranoid: true })
export class Tag extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.STRING(64))
  declare name: string;

  @BelongsTo(() => User)
  declare user?: User;
}
