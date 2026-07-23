import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Budget } from '../../database/models/budget.model';
import { Transaction } from '../../database/models/transaction.model';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

@Module({
  imports: [SequelizeModule.forFeature([Budget, Transaction])],
  controllers: [BudgetsController],
  providers: [BudgetsService, JwtOrApiKeyGuard],
  exports: [BudgetsService],
})
export class BudgetsModule {}
