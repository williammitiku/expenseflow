import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { StatusPill } from '@/components/common/StatusPill';
import { fetchHealth } from '@/services/health.api';
import { fetchUsers } from '@/services/users.api';

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 15_000,
  });

  const usersQuery = useQuery({
    queryKey: ['users', 'count'],
    queryFn: () => fetchUsers({ page: 1, limit: 1 }),
    staleTime: 15_000,
    retry: 1,
  });

  const data = healthQuery.data;
  const isLoading = healthQuery.isLoading;

  return (
    <AppShell>
      <h1 className="mb-2 text-4xl" style={{ fontFamily: 'var(--ef-font-display)' }}>
        Dashboard
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--ef-muted)]">
        Platform pulse while domain analytics modules are built.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          title="API"
          value={isLoading ? '…' : data?.status.toUpperCase() ?? '—'}
          hint="NestJS readiness"
        />
        <Metric
          title="Postgres"
          value={isLoading ? '…' : data?.checks.postgres.status.toUpperCase() ?? '—'}
          hint={
            data?.checks.postgres.latencyMs != null
              ? `${data.checks.postgres.latencyMs} ms`
              : 'Database'
          }
        />
        <Metric
          title="Redis"
          value={isLoading ? '…' : data?.checks.redis.status.toUpperCase() ?? '—'}
          hint={
            data?.checks.redis.latencyMs != null
              ? `${data.checks.redis.latencyMs} ms`
              : 'Cache / queues'
          }
        />
        <Metric
          title="Users"
          value={
            usersQuery.isLoading
              ? '…'
              : usersQuery.data
                ? String(usersQuery.data.meta.total)
                : '—'
          }
          hint="Registered accounts"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {data && (
          <StatusPill
            label={data.status === 'ok' ? 'All systems go' : 'Degraded'}
            tone={data.status === 'ok' ? 'good' : 'warn'}
          />
        )}
        <Link to="/users" className="text-sm text-[var(--ef-accent-soft)] hover:underline">
          View users →
        </Link>
        <Link to="/health" className="text-sm text-[var(--ef-accent-soft)] hover:underline">
          Detailed health →
        </Link>
      </div>
    </AppShell>
  );
}

function Metric({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-[rgba(154,240,197,0.2)] bg-[rgba(12,31,26,0.55)] p-4">
      <p className="text-xs font-semibold tracking-wide uppercase text-[var(--ef-accent-soft)]">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[var(--ef-muted)]">{hint}</p>
    </div>
  );
}
