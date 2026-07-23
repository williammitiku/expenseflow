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

@Table({ tableName: 'sessions', underscored: true, paranoid: true })
export class Session extends BaseModel {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ type: DataType.UUID, field: 'user_id' })
  declare userId: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING(255), field: 'refresh_token_hash' })
  declare refreshTokenHash: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(512), field: 'user_agent' })
  declare userAgent: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(64))
  declare ip: string | null;

  @AllowNull(false)
  @Column({ type: DataType.DATE, field: 'expires_at' })
  declare expiresAt: Date;

  @AllowNull(true)
  @Column({ type: DataType.DATE, field: 'revoked_at' })
  declare revokedAt: Date | null;

  @BelongsTo(() => User)
  declare user?: User;
}
