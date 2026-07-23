import { Module } from '@nestjs/common';
import { createUserScopedCrudModule } from '../../database/create-user-scoped-crud.module';
import { Subscription } from '../../database/models/subscription.model';

export const SubscriptionsModule = createUserScopedCrudModule({
  name: 'subscriptions',
  tag: 'subscriptions',
  model: Subscription,
});
