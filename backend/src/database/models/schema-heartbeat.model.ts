import {
  Column,
  DataType,
  Default,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';

export interface SchemaHeartbeatAttributes {
  id: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

@Table({
  tableName: 'schema_heartbeats',
  underscored: true,
  paranoid: true,
})
export class SchemaHeartbeat extends BaseModel<SchemaHeartbeatAttributes> {
  @Default('ok')
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  declare label: string;
}
