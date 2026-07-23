import { Module } from '@nestjs/common';
import { createUserScopedCrudModule } from '../../database/create-user-scoped-crud.module';
import { RecurringRule } from '../../database/models/recurring-rule.model';

export const RecurringModule = createUserScopedCrudModule({
  name: 'recurring',
  tag: 'recurring',
  model: RecurringRule,
});
