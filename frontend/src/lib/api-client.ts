import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Fallback for unauthenticated bootstrap / tooling
  const internalKey = import.meta.env.VITE_INTERNAL_API_KEY;
  if (!accessToken && internalKey) {
    config.headers['x-internal-api-key'] = internalKey;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      const { refreshToken, setSession, clearSession, user } = useAuthStore.getState();
      if (refreshToken && !original.url?.includes('/auth/refresh')) {
        original._retry = true;
        try {
          refreshPromise ??= (async () => {
            const { data } = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken },
            );
            setSession({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user ?? user!,
            });
            return data.accessToken as string;
          })().finally(() => {
            refreshPromise = null;
          });

          const token = await refreshPromise;
          if (token) {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          }
        } catch {
          clearSession();
        }
      }
    }

    const message =
      error.response?.data?.message ??
      error.message ??
      'Unexpected API error';
    return Promise.reject(
      new Error(Array.isArray(message) ? message.join(', ') : message),
    );
  },
);
