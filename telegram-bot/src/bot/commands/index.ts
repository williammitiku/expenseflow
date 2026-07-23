import type { Context, Telegraf } from 'telegraf';
import { APP_NAME } from '@expenseflow/shared';
import type { ApiWallet, ExpenseFlowApi } from '../../services/api-client';
import {
  MENU,
  isMenuLabel,
  mainMenuKeyboard,
  reportPeriodKeyboard,
  settingsKeyboard,
} from '../keyboards/menu';

async function requireUser(ctx: Context, api: ExpenseFlowApi) {
  const from = ctx.from;
  if (!from) {
    await ctx.reply('Could not identify your Telegram account.');
    return null;
  }

  const user = await api.upsertTelegramUser({
    telegramId: String(from.id),
    firstName: from.first_name || 'Telegram',
    lastName: from.last_name,
    username: from.username,
  });
  await api.ensureDefaultWallet(user.id, user.preferredCurrency || 'ETB');
  return user;
}

function formatSummary(
  label: string,
  summary: Awaited<ReturnType<ExpenseFlowApi['getSummary']>>,
) {
  const lines = [
    `📊 ${label}`,
    '',
    `Expense: ${summary.expenseTotal} ${summary.currency}`,
    `Income:  ${summary.incomeTotal} ${summary.currency}`,
    `Net:     ${summary.net} ${summary.currency}`,
    `Txns:    ${summary.transactionCount}`,
  ];

  if (summary.topMerchants.length) {
    lines.push('', 'Top merchants:');
    for (const m of summary.topMerchants) {
      lines.push(`• ${m.merchant}: ${m.total}`);
    }
  }

  if (summary.recent.length) {
    lines.push('', 'Recent:');
    for (const r of summary.recent.slice(0, 5)) {
      const sign = r.type === 'income' || r.type === 'refund' ? '+' : '-';
      lines.push(`• ${r.merchant ?? r.type} ${sign}${r.amount} ${r.currency}`);
    }
  }

  return lines.join('\n');
}

async function sendWallets(ctx: Context, api: ExpenseFlowApi) {
  const user = await requireUser(ctx, api);
  if (!user) return;
  const wallets = await api.listWallets(user.id);
  if (!wallets.length) {
    await ctx.reply('No wallets yet. Add an expense like: Coffee 250', mainMenuKeyboard());
    return;
  }
  await ctx.reply(
    [
      '👛 Your wallets',
      '',
      ...wallets.map(
        (w: ApiWallet) => `• ${w.name} (${w.type}): ${w.balance} ${w.currency}`,
      ),
    ].join('\n'),
    mainMenuKeyboard(),
  );
}

async function sendAccount(ctx: Context, api: ExpenseFlowApi) {
  const user = await requireUser(ctx, api);
  if (!user) return;
  const wallets = await api.listWallets(user.id);
  const month = await api.getSummary(user.id, 'month');

  await ctx.reply(
    [
      `✅ Logged in to ${APP_NAME}`,
      '',
      `Name: ${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`,
      user.username ? `Telegram: @${user.username}` : undefined,
      '',
      `This month`,
      `• Spent: ${month.expenseTotal} ${month.currency}`,
      `• Income: ${month.incomeTotal} ${month.currency}`,
      `• Wallets: ${wallets.length}`,
    ]
      .filter(Boolean)
      .join('\n'),
    mainMenuKeyboard(),
  );
}

async function sendBudgets(ctx: Context, api: ExpenseFlowApi) {
  const user = await requireUser(ctx, api);
  if (!user) return;
  const budgets = await api.listBudgets(user.id);
  if (!budgets.length) {
    await ctx.reply(
      'No budgets yet. Create them in the web dashboard under Finance.',
      mainMenuKeyboard(),
    );
    return;
  }
  await ctx.reply(
    [
      '📉 Budgets',
      '',
      ...budgets.map(
        (b) =>
          `• ${b.name} (${b.period}): ${b.spent}/${b.amount} ${b.currency} — ${b.percentUsed}% [${b.status}]`,
      ),
    ].join('\n'),
    mainMenuKeyboard(),
  );
}

async function sendGoals(ctx: Context, api: ExpenseFlowApi) {
  const user = await requireUser(ctx, api);
  if (!user) return;
  const goals = await api.listGoals(user.id);
  if (!goals.length) {
    await ctx.reply(
      'No goals yet. Create them in the web dashboard under Finance.',
      mainMenuKeyboard(),
    );
    return;
  }
  await ctx.reply(
    [
      '🎯 Goals',
      '',
      ...goals.map((g) => {
        const done = g.isComplete ? ' ✓' : '';
        const days =
          g.daysLeft != null ? ` · ${g.daysLeft}d left` : '';
        return `• ${g.name}${done}: ${g.currentAmount}/${g.targetAmount} ${g.currency} (${g.percentComplete}%)${days}`;
      }),
    ].join('\n'),
    mainMenuKeyboard(),
  );
}

async function sendReport(
  ctx: Context,
  api: ExpenseFlowApi,
  period: 'day' | 'week' | 'month' | 'year',
  edit = false,
) {
  const user = await requireUser(ctx, api);
  if (!user) return;

  const label =
    period === 'day'
      ? 'Today'
      : period === 'week'
        ? 'This week'
        : period === 'year'
          ? 'This year'
          : 'This month';

  const summary = await api.getSummary(user.id, period);
  const text = formatSummary(label, summary);

  if (edit && ctx.callbackQuery) {
    await ctx.editMessageText(text, reportPeriodKeyboard());
  } else {
    await ctx.reply(text, reportPeriodKeyboard());
  }
}

export function registerCommands(
  bot: Telegraf,
  api: ExpenseFlowApi,
  webUrl = 'http://localhost:5173',
) {
  bot.start(async (ctx) => {
    try {
      const user = await requireUser(ctx, api);
      if (!user) return;

      await ctx.reply(
        [
          `Welcome to ${APP_NAME}, ${user.firstName}!`,
          '',
          '✅ Your Telegram is linked.',
          '',
          'Use the menu below, or just type an expense:',
          'Coffee 250',
        ].join('\n'),
        mainMenuKeyboard(),
      );
    } catch (err) {
      console.error('[bot] /start', err);
      await ctx.reply('Login failed. Is the API running?', mainMenuKeyboard());
    }
  });

  bot.help(async (ctx) => {
    await ctx.reply(
      [
        'Tap the menu buttons under the chat.',
        '',
        'To add money in/out, send a message:',
        '• Coffee 250',
        '• Taxi 450',
        '• Salary 45000',
        '• Netflix 12$',
      ].join('\n'),
      mainMenuKeyboard(),
    );
  });

  bot.command('login', async (ctx) => {
    try {
      await sendAccount(ctx, api);
    } catch (err) {
      console.error('[bot] /login', err);
      await ctx.reply('Could not load your account.', mainMenuKeyboard());
    }
  });

  bot.command('menu', async (ctx) => {
    await ctx.reply('Main menu', mainMenuKeyboard());
  });

  bot.command('report', async (ctx) => {
    try {
      await ctx.reply('Pick a period:', reportPeriodKeyboard());
    } catch (err) {
      console.error('[bot] /report', err);
    }
  });

  bot.command('wallets', async (ctx) => {
    try {
      await sendWallets(ctx, api);
    } catch (err) {
      console.error('[bot] /wallets', err);
      await ctx.reply('Could not load wallets.', mainMenuKeyboard());
    }
  });

  bot.command('budgets', async (ctx) => {
    try {
      await sendBudgets(ctx, api);
    } catch (err) {
      console.error('[bot] /budgets', err);
      await ctx.reply('Could not load budgets.', mainMenuKeyboard());
    }
  });

  bot.command('goals', async (ctx) => {
    try {
      await sendGoals(ctx, api);
    } catch (err) {
      console.error('[bot] /goals', err);
      await ctx.reply('Could not load goals.', mainMenuKeyboard());
    }
  });

  bot.command('settings', async (ctx) => {
    await ctx.reply('Settings', settingsKeyboard(webUrl));
  });

  /** Reply-keyboard menu taps */
  bot.hears(MENU.REPORTS, async (ctx) => {
    await ctx.reply('Pick a period:', reportPeriodKeyboard());
  });

  bot.hears(MENU.WALLETS, async (ctx) => {
    try {
      await sendWallets(ctx, api);
    } catch (err) {
      console.error('[bot] menu wallets', err);
      await ctx.reply('Could not load wallets.', mainMenuKeyboard());
    }
  });

  bot.hears(MENU.BUDGETS, async (ctx) => {
    try {
      await sendBudgets(ctx, api);
    } catch (err) {
      console.error('[bot] menu budgets', err);
      await ctx.reply('Could not load budgets.', mainMenuKeyboard());
    }
  });

  bot.hears(MENU.GOALS, async (ctx) => {
    try {
      await sendGoals(ctx, api);
    } catch (err) {
      console.error('[bot] menu goals', err);
      await ctx.reply('Could not load goals.', mainMenuKeyboard());
    }
  });

  bot.hears(MENU.ACCOUNT, async (ctx) => {
    try {
      await sendAccount(ctx, api);
    } catch (err) {
      console.error('[bot] menu account', err);
      await ctx.reply('Could not load account.', mainMenuKeyboard());
    }
  });

  bot.hears(MENU.SETTINGS, async (ctx) => {
    await ctx.reply('Settings', settingsKeyboard(webUrl));
  });

  bot.hears(MENU.ADD_HINT, async (ctx) => {
    await ctx.reply(
      [
        '➕ Add an expense or income',
        '',
        'Just type it in the chat:',
        '',
        'Coffee 250',
        'Lunch with friends 900',
        'Salary 45000',
        'Netflix 12$',
        '',
        'I’ll confirm if I’m unsure.',
      ].join('\n'),
      mainMenuKeyboard(),
    );
  });

  /** Inline callbacks for reports + settings */
  bot.action(/^rpt:(day|week|month|year)$/, async (ctx) => {
    const period = ctx.match[1] as 'day' | 'week' | 'month' | 'year';
    try {
      await ctx.answerCbQuery();
      await sendReport(ctx, api, period, true);
    } catch (err) {
      console.error('[bot] rpt callback', err);
      await ctx.answerCbQuery('Error loading report');
    }
  });

  bot.action('set:account', async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await sendAccount(ctx, api);
    } catch {
      await ctx.reply('Could not load account.', mainMenuKeyboard());
    }
  });

  bot.action('set:wallets', async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await sendWallets(ctx, api);
    } catch {
      await ctx.reply('Could not load wallets.', mainMenuKeyboard());
    }
  });

  bot.action('set:budgets', async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await sendBudgets(ctx, api);
    } catch {
      await ctx.reply('Could not load budgets.', mainMenuKeyboard());
    }
  });

  bot.action('set:goals', async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await sendGoals(ctx, api);
    } catch {
      await ctx.reply('Could not load goals.', mainMenuKeyboard());
    }
  });

  bot.action('set:help', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      [
        `${APP_NAME} help`,
        '',
        'Use the bottom menu for reports, wallets, budgets, and goals.',
        'Type expenses naturally: Coffee 250',
      ].join('\n'),
      mainMenuKeyboard(),
    );
  });

  bot.action('menu:home', async (ctx) => {
    await ctx.answerCbQuery('Menu');
    try {
      await ctx.editMessageText('Use the menu below 👇');
    } catch {
      // message might not be editable
    }
    await ctx.reply('Main menu', mainMenuKeyboard());
  });
}

export { isMenuLabel };
