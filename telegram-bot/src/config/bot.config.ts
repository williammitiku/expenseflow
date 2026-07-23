import { APP_NAME } from '@expenseflow/shared';

export interface BotConfig {
  token: string;
  username: string;
  apiBaseUrl: string;
  internalApiKey: string;
}

export function loadBotConfig(): BotConfig {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN ?? '',
    username: process.env.TELEGRAM_BOT_USERNAME ?? '',
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000/api/v1',
    internalApiKey: process.env.INTERNAL_API_KEY ?? '',
  };
}

export const botDisplayName = APP_NAME;
