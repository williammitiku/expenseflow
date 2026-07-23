import { api } from '@/lib/api-client';

export type DependencyStatus = 'up' | 'down';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  uptime: number;
  checks: {
    postgres: { status: DependencyStatus; latencyMs?: number; error?: string };
    redis: { status: DependencyStatus; latencyMs?: number; error?: string };
  };
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
}
