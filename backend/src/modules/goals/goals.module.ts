import { Module } from '@nestjs/common';
import { createUserScopedCrudModule } from '../../database/create-user-scoped-crud.module';
import { Goal } from '../../database/models/goal.model';

export const GoalsModule = createUserScopedCrudModule({
  name: 'goals',
  tag: 'goals',
  model: Goal,
});
