import { Module } from '@nestjs/common';
import { createUserScopedCrudModule } from '../../database/create-user-scoped-crud.module';
import { Category } from '../../database/models/category.model';

export const CategoriesModule = createUserScopedCrudModule({
  name: 'categories',
  tag: 'categories',
  model: Category,
});
