import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { ProgressBar } from '@/components/common/ProgressBar';
import { StatusPill } from '@/components/common/StatusPill';
import { useAuthStore } from '@/stores/auth.store';
import { fetchHealth } from '@/services/health.api';
import {
  fetchAnalyticsSummary,
  fetchBudgets,
  fetchGoals,
  fetchWallets,
} from '@/services/finance.api';

export function DashboardPage() {
  const userId = useAuthStore((s) => s.user?.id);

  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 15_000,
  });

  const summaryQuery = useQuery({
    queryKey: ['analytics', 'month', userId],
    queryFn: () => fetchAnalyticsSummary('month'),
    enabled: Boolean(userId),
  });

  const walletsQuery = useQuery({
    queryKey: ['wallets', userId],
    queryFn: fetchWallets,
    enabled: Boolean(userId),
  });

  const budgetsQuery = useQuery({
    queryKey: ['budgets', userId],
    queryFn: fetchBudgets,
    enabled: Boolean(userId),
  });

  const goalsQuery = useQuery({
    queryKey: ['goals', userId],
    queryFn: fetchGoals,
    enabled: Boolean(userId),
  });

  const data = healthQuery.data;
  const summary = summaryQuery.data;
  const wallets = walletsQuery.data?.data ?? [];
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

  return (
    <AppShell>
      <h1 className="mb-2 text-4xl" style={{ fontFamily: 'var(--ef-font-display)' }}>
        Dashboard
      </h1>
      <p className="mb-8 max-w-2xl text-[var(--ef-muted)]">
        This month’s cash flow, budgets, and goals at a glance.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          title="Net this month"
          value={
            summaryQuery.isLoading
              ? '…'
              : summary
                ? `${summary.net} ${summary.currency}`
                : '—'
          }
          hint={
            summary
              ? `In ${summary.incomeTotal} · Out ${summary.expenseTotal}`
              : 'Income − expenses'
          }
        />
        <Metric
          title="Wallet balance"
          value={walletsQuery.isLoading ? '…' : `${totalBalance.toFixed(2)} ETB`}
          hint={`${wallets.length} wallet${wallets.length === 1 ? '' : 's'}`}
        />
        <Metric
          title="Budgets"
          value={String(budgetsQuery.data?.meta.total ?? 0)}
          hint={
            budgetsQuery.data?.data.some((b) => b.status === 'exceeded')
              ? 'Some over limit'
              : 'Active limits'
          }
        />
        <Metric
          title="Goals"
          value={String(goalsQuery.data?.meta.total ?? 0)}
          hint={
            goalsQuery.data?.data.filter((g) => g.isComplete).length
              ? `${goalsQuery.data.data.filter((g) => g.isComplete).length} complete`
              : 'Savings targets'
          }
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[rgba(154,240,197,0.15)] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ef-accent-soft)]">
            Budget health
          </h2>
          <div className="space-y-3">
            {(budgetsQuery.data?.data ?? []).slice(0, 4).map((b) => (
              <div key={b.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="text-[var(--ef-muted)]">{b.percentUsed}%</span>
                </div>
                <ProgressBar percent={b.percentUsed} status={b.status} />
              </div>
            ))}
            {!budgetsQuery.data?.data.length && (
              <p className="text-sm text-[var(--ef-muted)]">
                No budgets yet.{' '}
                <Link to="/finance" className="text-[var(--ef-accent-soft)] hover:underline">
                  Create one →
                </Link>
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[rgba(154,240,197,0.15)] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--ef-accent-soft)]">
            Goal progress
          </h2>
          <div className="space-y-3">
            {(goalsQuery.data?.data ?? []).slice(0, 4).map((g) => (
              <div key={g.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>
                    {g.name}
                    {g.isComplete ? ' ✓' : ''}
                  </span>
                  <span className="text-[var(--ef-muted)]">{g.percentComplete}%</span>
                </div>
                <ProgressBar
                  percent={g.percentComplete}
                  status={g.isComplete ? 'complete' : 'ok'}
                />
              </div>
            ))}
            {!goalsQuery.data?.data.length && (
              <p className="text-sm text-[var(--ef-muted)]">
                No goals yet.{' '}
                <Link to="/finance" className="text-[var(--ef-accent-soft)] hover:underline">
                  Set a target →
                </Link>
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {data && (
          <StatusPill
            label={data.status === 'ok' ? 'API healthy' : 'API degraded'}
            tone={data.status === 'ok' ? 'good' : 'warn'}
          />
        )}
        <Link to="/finance" className="text-sm text-[var(--ef-accent-soft)] hover:underline">
          Open finance →
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
