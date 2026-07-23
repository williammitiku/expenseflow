import { api } from '@/lib/api-client';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: string;
  currency: string;
  balance: string;
  isShared: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string | null;
  type: string;
  amount: string;
  currency: string;
  merchant: string | null;
  note: string | null;
  occurredAt: string;
}

export interface Budget {
  id: string;
  name: string;
  period: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  walletId: string | null;
  startDate: string;
  spent: string;
  remaining: string;
  percentUsed: number;
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
  alertThresholds: number[];
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  currency: string;
  deadline: string | null;
  walletId: string | null;
  remaining: string;
  percentComplete: number;
  isComplete: boolean;
  daysLeft: number | null;
}

export interface AnalyticsSummary {
  period: string;
  currency: string;
  expenseTotal: string;
  incomeTotal: string;
  net: string;
  transactionCount: number;
  topMerchants: Array<{ merchant: string; total: string }>;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function fetchWallets(): Promise<Paginated<Wallet>> {
  const { data } = await api.get<Paginated<Wallet>>('/wallets', {
    params: { limit: 50 },
  });
  return data;
}

export async function createWallet(input: {
  name: string;
  type: string;
  currency?: string;
  balance?: string;
}): Promise<Wallet> {
  const { data } = await api.post<Wallet>('/wallets', {
    ...input,
    balance: input.balance ?? '0.00',
    currency: input.currency ?? 'ETB',
  });
  return data;
}

export async function fetchTransactions(): Promise<Paginated<Transaction>> {
  const { data } = await api.get<Paginated<Transaction>>('/transactions', {
    params: { limit: 50 },
  });
  return data;
}

export async function createTransaction(input: {
  walletId: string;
  type: string;
  amount: number;
  currency?: string;
  merchant?: string;
  note?: string;
  occurredAt?: string;
}): Promise<Transaction> {
  const { data } = await api.post<Transaction>('/transactions', {
    ...input,
    amount: Number(input.amount).toFixed(2),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });
  return data;
}

export async function fetchBudgets(): Promise<Paginated<Budget>> {
  const { data } = await api.get<Paginated<Budget>>('/budgets', {
    params: { limit: 50 },
  });
  return data;
}

export async function createBudget(input: {
  name: string;
  period: string;
  amount: number;
  currency?: string;
  walletId?: string;
  categoryId?: string;
  startDate: string;
}): Promise<Budget> {
  const { data } = await api.post<Budget>('/budgets', input);
  return data;
}

export async function deleteBudget(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}

export async function fetchGoals(): Promise<Paginated<Goal>> {
  const { data } = await api.get<Paginated<Goal>>('/goals', {
    params: { limit: 50 },
  });
  return data;
}

export async function createGoal(input: {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  currency?: string;
  deadline?: string;
  walletId?: string;
}): Promise<Goal> {
  const { data } = await api.post<Goal>('/goals', input);
  return data;
}

export async function contributeGoal(
  id: string,
  input: { amount: number; walletId?: string },
): Promise<Goal> {
  const { data } = await api.post<Goal>(`/goals/${id}/contribute`, input);
  return data;
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}

export async function fetchCategories() {
  const { data } = await api.get('/categories', { params: { limit: 100 } });
  return data;
}

export async function fetchAnalyticsSummary(
  period: 'day' | 'week' | 'month' | 'year' = 'month',
): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>('/analytics/summary', {
    params: { period },
  });
  return data;
}
