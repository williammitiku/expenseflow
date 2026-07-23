import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchemaHeartbeat } from '../models/schema-heartbeat.model';
import { BaseRepository } from './base.repository';

@Injectable()
export class SchemaHeartbeatRepository extends BaseRepository<SchemaHeartbeat> {
  constructor(
    @InjectModel(SchemaHeartbeat)
    model: typeof SchemaHeartbeat,
  ) {
    super(model);
  }

  latest(): Promise<SchemaHeartbeat | null> {
    return this.findOne({
      order: [['createdAt', 'DESC']],
    });
  }
}
