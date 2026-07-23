import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/sequelize';
import { APP_NAME } from '@expenseflow/shared';
import { Sequelize } from 'sequelize-typescript';
import Redis from 'ioredis';

export type DependencyStatus = 'up' | 'down';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptime: number;
  checks: {
    postgres: { status: DependencyStatus; latencyMs?: number; error?: string };
    redis: { status: DependencyStatus; latencyMs?: number; error?: string };
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly config: ConfigService,
    @InjectConnection() private readonly sequelize: Sequelize,
  ) {}

  async getStatus(): Promise<HealthStatus> {
    const [postgres, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);

    const allUp = postgres.status === 'up' && redis.status === 'up';

    return {
      status: allUp ? 'ok' : 'degraded',
      service: this.config.get<string>('app.name', APP_NAME),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: { postgres, redis },
    };
  }

  private async checkPostgres(): Promise<HealthStatus['checks']['postgres']> {
    const started = Date.now();
    try {
      await this.sequelize.query('SELECT 1');
      return { status: 'up', latencyMs: Date.now() - started };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : 'Unknown postgres error',
      };
    }
  }

  private async checkRedis(): Promise<HealthStatus['checks']['redis']> {
    const started = Date.now();
    const redisUrl = this.config.get<string | undefined>('redis.url');
    const host = this.config.get<string>('redis.host', 'localhost');
    const port = this.config.get<number>('redis.port', 6379);
    const password = this.config.get<string | undefined>('redis.password');
    const tls = this.config.get<boolean>('redis.tls');

    const client = redisUrl
      ? new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          connectTimeout: 3_000,
        })
      : new Redis({
          host,
          port,
          password,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          connectTimeout: 3_000,
          ...(tls ? { tls: {} } : {}),
        });

    try {
      await client.connect();
      const pong = await client.ping();
      if (pong !== 'PONG') {
        throw new Error(`Unexpected PING response: ${pong}`);
      }
      return { status: 'up', latencyMs: Date.now() - started };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : 'Unknown redis error',
      };
    } finally {
      client.disconnect();
    }
  }
}
