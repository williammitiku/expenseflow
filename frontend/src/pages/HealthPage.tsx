import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchHealth } from '@/services/health.api';
import { StatusPill } from '@/components/common/StatusPill';
import { AppShell } from '@/components/layout/AppShell';

export function HealthPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  });

  return (
    <AppShell>
      <Link to="/" className="text-sm text-[var(--ef-accent-soft)] hover:underline">
        ← Back
      </Link>

      <h1
        className="mt-6 mb-2 text-4xl"
        style={{ fontFamily: 'var(--ef-font-display)' }}
      >
        System health
      </h1>
      <p className="mb-8 text-[var(--ef-muted)]">
        Live checks against Postgres and Redis.
      </p>

      {isLoading && <p className="text-[var(--ef-muted)]">Checking API…</p>}
      {isError && (
        <p className="text-red-300">
          {(error as Error).message || 'Failed to reach API'}
        </p>
      )}

      {data && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill
              label={`API ${data.status}`}
              tone={data.status === 'ok' ? 'good' : 'warn'}
            />
            <span className="text-sm text-[var(--ef-muted)]">{data.service}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DependencyCard
              name="PostgreSQL"
              status={data.checks.postgres.status}
              latencyMs={data.checks.postgres.latencyMs}
              error={data.checks.postgres.error}
            />
            <DependencyCard
              name="Redis"
              status={data.checks.redis.status}
              latencyMs={data.checks.redis.latencyMs}
              error={data.checks.redis.error}
            />
          </div>

          <pre className="overflow-x-auto rounded-lg border border-[rgba(154,240,197,0.2)] bg-[rgba(12,31,26,0.7)] p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <button
        type="button"
        onClick={() => void refetch()}
        className="mt-6 rounded-md border border-[rgba(154,240,197,0.35)] px-4 py-2 text-sm"
        disabled={isFetching}
      >
        {isFetching ? 'Refreshing…' : 'Refresh'}
      </button>
    </AppShell>
  );
}

function DependencyCard({
  name,
  status,
  latencyMs,
  error,
}: {
  name: string;
  status: 'up' | 'down';
  latencyMs?: number;
  error?: string;
}) {
  return (
    <div className="rounded-lg border border-[rgba(154,240,197,0.2)] bg-[rgba(12,31,26,0.55)] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-[var(--ef-accent-soft)]">
          {name}
        </h2>
        <StatusPill label={status} tone={status === 'up' ? 'good' : 'bad'} />
      </div>
      <p className="text-sm text-[var(--ef-muted)]">
        Latency: {latencyMs != null ? `${latencyMs} ms` : '—'}
      </p>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
