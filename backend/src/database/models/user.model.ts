import {
  AllowNull,
  Column,
  DataType,
  Default,
  Table,
} from 'sequelize-typescript';
import { UserRole } from '@expenseflow/shared';
import { BaseModel } from './base.model';

export interface UserSettings {
  darkMode?: boolean;
  notifyChannels?: string[];
  [key: string]: unknown;
}

export interface UserAttributes {
  id: string;
  telegramId: string | null;
  username: string | null;
  firstName: string;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  preferredCurrency: string;
  timezone: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type UserCreationAttributes = Omit<
  UserAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  id?: string;
  telegramId?: string | null;
  username?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  preferredCurrency?: string;
  timezone?: string;
  settings?: UserSettings;
};

@Table({
  tableName: 'users',
  underscored: true,
  paranoid: true,
})
export class User extends BaseModel<UserAttributes, UserCreationAttributes> {
  /** Stored as BIGINT; exposed as string to avoid JS precision loss */
  @AllowNull(true)
  @Column({
    type: DataType.BIGINT,
    field: 'telegram_id',
  })
  declare telegramId: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(64))
  declare username: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(120), field: 'first_name' })
  declare firstName: string;

  @AllowNull(true)
  @Column({ type: DataType.STRING(120), field: 'last_name' })
  declare lastName: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare email: string | null;

  @AllowNull(true)
  @Column({ type: DataType.TEXT, field: 'avatar_url' })
  declare avatarUrl: string | null;

  @Default(UserRole.USER)
  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  declare role: UserRole;

  @Default('ETB')
  @Column({
    type: DataType.CHAR(3),
    field: 'preferred_currency',
    allowNull: false,
  })
  declare preferredCurrency: string;

  @Default('Africa/Addis_Ababa')
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  declare timezone: string;

  @Default({})
  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  declare settings: UserSettings;
}
