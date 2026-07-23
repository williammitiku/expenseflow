import { TransactionType, type TransactionDraft } from '@expenseflow/shared';
import type { BotConfig } from '../config/bot.config';

export interface ApiUser {
  id: string;
  telegramId: string | null;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  preferredCurrency?: string;
}

export interface ApiWallet {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: string;
}

export interface AnalyticsSummary {
  period: string;
  from: string;
  to: string;
  currency: string;
  expenseTotal: string;
  incomeTotal: string;
  net: string;
  transactionCount: number;
  topMerchants: Array<{ merchant: string; total: string }>;
  recent: Array<{
    type: string;
    amount: string;
    currency: string;
    merchant: string | null;
    occurredAt: string;
  }>;
  wallets: ApiWallet[];
}

interface Paginated<T> {
  data: T[];
}

export class ExpenseFlowApi {
  constructor(private readonly config: BotConfig) {}

  private async request<T>(
    path: string,
    init?: RequestInit & { query?: Record<string, string | number | undefined> },
  ): Promise<T> {
    const url = new URL(`${this.config.apiBaseUrl}${path}`);
    if (init?.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
      }
    }

    const { query: _q, ...rest } = init ?? {};
    const res = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': this.config.internalApiKey,
        ...(rest.headers ?? {}),
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API ${res.status}: ${body}`);
    }

    return (await res.json()) as T;
  }

  async upsertTelegramUser(input: {
    telegramId: string;
    firstName: string;
    lastName?: string;
    username?: string;
  }): Promise<ApiUser> {
    return this.request<ApiUser>('/users/telegram/upsert', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async listWallets(userId: string): Promise<ApiWallet[]> {
    const listed = await this.request<Paginated<ApiWallet>>('/wallets', {
      query: { userId, limit: 50 },
    });
    return listed.data;
  }

  async ensureDefaultWallet(userId: string, currency = 'ETB'): Promise<ApiWallet> {
    const wallets = await this.listWallets(userId);
    if (wallets.length > 0) {
      return wallets[0];
    }

    return this.request<ApiWallet>('/wallets', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        name: 'Cash',
        type: 'cash',
        currency,
        balance: '0.00',
      }),
    });
  }

  async getSummary(
    userId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month',
  ): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>('/analytics/summary', {
      query: { userId, period },
    });
  }

  async createTransaction(input: {
    userId: string;
    walletId: string;
    draft: TransactionDraft;
  }) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify({
        userId: input.userId,
        walletId: input.walletId,
        type: input.draft.type,
        amount: input.draft.amount.toFixed(2),
        currency: input.draft.currency,
        merchant: input.draft.merchant,
        note: input.draft.note,
        occurredAt: new Date().toISOString(),
        metadata: {
          source: 'telegram-bot',
          confidence: input.draft.confidence,
        },
      }),
    });
  }

  async listBudgets(userId: string) {
    const listed = await this.request<{
      data: Array<{
        name: string;
        period: string;
        amount: string;
        currency: string;
        spent: string;
        remaining: string;
        percentUsed: number;
        status: string;
      }>;
    }>('/budgets', { query: { userId, limit: 20 } });
    return listed.data;
  }

  async listGoals(userId: string) {
    const listed = await this.request<{
      data: Array<{
        name: string;
        targetAmount: string;
        currentAmount: string;
        currency: string;
        percentComplete: number;
        isComplete: boolean;
        daysLeft: number | null;
      }>;
    }>('/goals', { query: { userId, limit: 20 } });
    return listed.data;
  }
}

export function formatDraft(draft: TransactionDraft): string {
  const sign = draft.type === TransactionType.INCOME ? '+' : '-';
  return `${draft.type.toUpperCase()}: ${draft.merchant ?? 'Unknown'} ${sign}${draft.amount} ${draft.currency}`;
}
