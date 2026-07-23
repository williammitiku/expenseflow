import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Goal } from '../../database/models/goal.model';
import { Wallet } from '../../database/models/wallet.model';
import { Transaction } from '../../database/models/transaction.model';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [SequelizeModule.forFeature([Goal, Wallet, Transaction])],
  controllers: [GoalsController],
  providers: [GoalsService, JwtOrApiKeyGuard],
  exports: [GoalsService],
})
export class GoalsModule {}
