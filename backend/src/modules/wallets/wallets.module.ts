import { Module } from '@nestjs/common';
import { createUserScopedCrudModule } from '../../database/create-user-scoped-crud.module';
import { Wallet } from '../../database/models/wallet.model';

export const WalletsModule = createUserScopedCrudModule({
  name: 'wallets',
  tag: 'wallets',
  model: Wallet,
});
