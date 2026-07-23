import { registerAs } from '@nestjs/config';
import { APP_NAME, DEFAULT_CURRENCY, DEFAULT_TIMEZONE } from '@expenseflow/shared';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME ?? APP_NAME,
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(
    process.env.PORT ?? process.env.APP_PORT ?? process.env.API_PORT ?? '3000',
    10,
  ),
  url: process.env.APP_URL ?? 'http://localhost:3000',
  corsOrigins: process.env.CORS_ORIGINS ?? 'http://localhost:5173',
  defaultCurrency: process.env.DEFAULT_CURRENCY ?? DEFAULT_CURRENCY,
  defaultTimezone: process.env.DEFAULT_TIMEZONE ?? DEFAULT_TIMEZONE,
}));
