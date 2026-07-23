import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction } from '../../database/models/transaction.model';
import { Wallet } from '../../database/models/wallet.model';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, Wallet])],
  controllers: [AnalyticsController],
  providers: [JwtOrApiKeyGuard],
})
export class AnalyticsModule {}
