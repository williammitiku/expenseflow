import { Markup } from 'telegraf';

/** Persistent bottom menu — tap instead of typing slash commands */
export const MENU = {
  REPORTS: '📊 Reports',
  WALLETS: '👛 Wallets',
  ACCOUNT: '👤 Account',
  SETTINGS: '⚙️ Settings',
  ADD_HINT: '➕ How to add',
} as const;

export const MENU_LABELS = new Set<string>(Object.values(MENU));

export function mainMenuKeyboard() {
  return Markup.keyboard([
    [MENU.REPORTS, MENU.WALLETS],
    [MENU.ACCOUNT, MENU.SETTINGS],
    [MENU.ADD_HINT],
  ])
    .resize()
    .persistent();
}

export function reportPeriodKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Today', 'rpt:day'),
      Markup.button.callback('Week', 'rpt:week'),
    ],
    [
      Markup.button.callback('Month', 'rpt:month'),
      Markup.button.callback('Year', 'rpt:year'),
    ],
    [Markup.button.callback('« Back to menu', 'menu:home')],
  ]);
}

export function settingsKeyboard(webUrl?: string) {
  const rows: ReturnType<typeof Markup.button.callback>[][] = [
    [Markup.button.callback('🔐 Account status', 'set:account')],
    [Markup.button.callback('📊 Quick month report', 'rpt:month')],
    [Markup.button.callback('👛 My wallets', 'set:wallets')],
  ];

  if (webUrl) {
    rows.push([Markup.button.url('🌐 Open dashboard', webUrl) as never]);
  }

  rows.push([Markup.button.callback('❓ Help', 'set:help')]);
  rows.push([Markup.button.callback('« Close', 'menu:home')]);

  return Markup.inlineKeyboard(rows as never);
}

export function isMenuLabel(text: string): boolean {
  return MENU_LABELS.has(text.trim());
}
