import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../database/models/user.model';
import { UsersRepository } from '../../database/repositories/users.repository';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, JwtOrApiKeyGuard],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
