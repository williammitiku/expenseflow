import { api } from '@/lib/api-client';

export interface User {
  id: string;
  telegramId: string | null;
  username: string | null;
  firstName: string;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  preferredCurrency: string;
  timezone: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUsers {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchUsers(params?: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<PaginatedUsers> {
  const { data } = await api.get<PaginatedUsers>('/users', { params });
  return data;
}
