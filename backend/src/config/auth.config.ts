import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtAccessSecret:
    process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me_32chars',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me_32chars',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  internalApiKey: process.env.INTERNAL_API_KEY ?? '',
  allowDevLogin: (process.env.NODE_ENV ?? 'development') !== 'production',
}));
