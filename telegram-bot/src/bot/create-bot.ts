import { Telegraf } from 'telegraf';
import type { BotConfig } from '../config/bot.config';
import { ExpenseFlowApi } from '../services/api-client';
import { registerCommands, isMenuLabel } from './commands';
import { createExpenseHandlers } from './handlers/expense.handler';

export function createBot(config: BotConfig): Telegraf {
  const bot = new Telegraf(config.token);
  const api = new ExpenseFlowApi(config);
  const webUrl = process.env.APP_URL || 'http://localhost:5173';

  registerCommands(bot, api, webUrl);

  const expenses = createExpenseHandlers(config);

  bot.on('text', async (ctx, next) => {
    const text =
      ctx.message && 'text' in ctx.message ? ctx.message.text.trim() : '';

    // Reply-keyboard menu labels are handled by bot.hears — skip expense parse
    if (!text || text.startsWith('/') || isMenuLabel(text)) {
      return next();
    }

    try {
      await expenses.handleText(ctx);
    } catch (err) {
      console.error('[bot] expense text error', err);
      await ctx.reply('Sorry — could not save that. Is the API running?');
    }
  });

  bot.on('callback_query', async (ctx, next) => {
    const data =
      ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? ctx.callbackQuery.data
        : '';

    // Expense confirmations only; menu/report callbacks handled above
    if (!data.startsWith('exp:')) {
      return next();
    }

    try {
      await expenses.handleCallback(ctx);
    } catch (err) {
      console.error('[bot] expense callback error', err);
      await ctx.answerCbQuery('Error');
    }
  });

  return bot;
}

/** Register Telegram's native commands menu (☰ next to the text field) */
export async function setupBotMenu(bot: Telegraf) {
  await bot.telegram.setMyCommands([
    { command: 'start', description: 'Open menu & login' },
    { command: 'menu', description: 'Show main menu' },
    { command: 'report', description: 'Spending reports' },
    { command: 'wallets', description: 'Wallet balances' },
    { command: 'login', description: 'Account status' },
    { command: 'settings', description: 'Settings' },
    { command: 'help', description: 'How to add expenses' },
  ]);
}
