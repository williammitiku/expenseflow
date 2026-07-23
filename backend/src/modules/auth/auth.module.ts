import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { Session } from '../../database/models/session.model';
import { Subscription } from '../../database/models/subscription.model';
import { User } from '../../database/models/user.model';
import { UsersRepository } from '../../database/repositories/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtAccessSecret'),
      }),
    }),
    SequelizeModule.forFeature([Session, Subscription, User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    JwtStrategy,
    JwtOrApiKeyGuard,
  ],
  exports: [AuthService, JwtModule, PassportModule, JwtOrApiKeyGuard],
})
export class AuthModule {}
