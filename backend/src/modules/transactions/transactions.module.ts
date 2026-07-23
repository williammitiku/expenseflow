import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transaction } from '../../database/models/transaction.model';
import { Wallet } from '../../database/models/wallet.model';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [SequelizeModule.forFeature([Transaction, Wallet])],
  controllers: [TransactionsController],
  providers: [TransactionsService, JwtOrApiKeyGuard],
  exports: [TransactionsService],
})
export class TransactionsModule {}
