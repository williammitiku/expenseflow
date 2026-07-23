import { Module } from '@nestjs/common';
import { createUserScopedCrudModule } from '../../database/create-user-scoped-crud.module';
import { Budget } from '../../database/models/budget.model';

export const BudgetsModule = createUserScopedCrudModule({
  name: 'budgets',
  tag: 'budgets',
  model: Budget,
});
