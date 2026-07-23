import { Module } from '@nestjs/common';
import { createUserScopedCrudModule } from '../../database/create-user-scoped-crud.module';
import { Tag } from '../../database/models/tag.model';

export const TagsModule = createUserScopedCrudModule({
  name: 'tags',
  tag: 'tags',
  model: Tag,
});
