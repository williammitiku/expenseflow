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

export async function fetchTransactions(): Promise<Paginated<Transaction>> {
  const { data } = await api.get<Paginated<Transaction>>('/transactions', {
    params: { limit: 50 },
  });
  return data;
}

export async function fetchBudgets() {
  const { data } = await api.get('/budgets', { params: { limit: 50 } });
  return data;
}

export async function fetchGoals() {
  const { data } = await api.get('/goals', { params: { limit: 50 } });
  return data;
}

export async function fetchCategories() {
  const { data } = await api.get('/categories', { params: { limit: 100 } });
  return data;
}
