import { api } from '@/lib/api-client';
import type { AuthUser } from '@/stores/auth.store';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
  user: AuthUser;
}

export async function devLogin(email?: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/dev-login', { email });
  return data;
}

export async function refreshAuth(refreshToken: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
  return data;
}

export async function logoutAuth(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken });
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

export async function telegramLogin(
  payload: Record<string, string | number>,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/telegram', payload);
  return data;
}
