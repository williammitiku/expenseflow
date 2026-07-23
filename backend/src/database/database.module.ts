import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Budget,
  Category,
  Goal,
  Notification,
  RecurringRule,
  SchemaHeartbeat,
  Session,
  Subscription,
  Tag,
  Transaction,
  User,
  Wallet,
  WalletMember,
} from './models';
import { SchemaHeartbeatRepository } from './repositories/schema-heartbeat.repository';

const models = [
  SchemaHeartbeat,
  User,
  Session,
  Category,
  Tag,
  Wallet,
  WalletMember,
  RecurringRule,
  Transaction,
  Budget,
  Goal,
  Notification,
  Subscription,
];

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ssl = config.get<boolean>('database.ssl');
        return {
          dialect: 'postgres' as const,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.database'),
          autoLoadModels: true,
          synchronize: false,
          logging: config.get<boolean>('database.logging') ? console.log : false,
          dialectOptions: ssl
            ? {
                ssl: {
                  require: true,
                  rejectUnauthorized: false,
                },
              }
            : {},
          define: {
            underscored: true,
            timestamps: true,
            paranoid: true,
          },
          models,
          pool: {
            max: config.get<number>('database.poolMax', 5),
            min: 0,
            acquire: 30_000,
            idle: 10_000,
          },
        };
      },
    }),
    SequelizeModule.forFeature(models),
  ],
  providers: [SchemaHeartbeatRepository],
  exports: [SequelizeModule, SchemaHeartbeatRepository],
})
export class DatabaseModule {}
