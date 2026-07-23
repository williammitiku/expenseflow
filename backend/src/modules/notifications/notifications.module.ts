import { Module } from '@nestjs/common';
import { createUserScopedCrudModule } from '../../database/create-user-scoped-crud.module';
import { Notification } from '../../database/models/notification.model';

export const NotificationsModule = createUserScopedCrudModule({
  name: 'notifications',
  tag: 'notifications',
  model: Notification,
});
