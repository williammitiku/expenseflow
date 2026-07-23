import path from 'node:path';
import dotenv from 'dotenv';
import { APP_NAME } from '@expenseflow/shared';
import { createBot, setupBotMenu } from './bot/create-bot';
import { loadBotConfig } from './config/bot.config';

// Prefer monorepo root .env, then local
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

async function main() {
  const config = loadBotConfig();

  if (!config.token) {
    console.warn(
      `[${APP_NAME} Bot] TELEGRAM_BOT_TOKEN is not set — bot will not start. Set the token to enable Telegram.`,
    );
    setInterval(() => undefined, 60_000);
    return;
  }

  const bot = createBot(config);
  await setupBotMenu(bot);
  await bot.launch();
  console.log(`[${APP_NAME} Bot] started as @${config.username || 'unknown'}`);
  console.log(`[${APP_NAME} Bot] menu keyboard + commands registered`);

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
