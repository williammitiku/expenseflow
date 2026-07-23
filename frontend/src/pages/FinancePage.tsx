import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/auth.store';
import {
  fetchBudgets,
  fetchGoals,
  fetchTransactions,
  fetchWallets,
} from '@/services/finance.api';

export function FinancePage() {
  const userId = useAuthStore((s) => s.user?.id);

  const walletsQuery = useQuery({
    queryKey: ['wallets', userId],
    queryFn: () => fetchWallets(),
    enabled: Boolean(userId),
  });

  const txQuery = useQuery({
    queryKey: ['transactions', userId],
    queryFn: () => fetchTransactions(),
    enabled: Boolean(userId),
  });

  const budgetsQuery = useQuery({
    queryKey: ['budgets', userId],
    queryFn: () => fetchBudgets(),
    enabled: Boolean(userId),
  });

  const goalsQuery = useQuery({
    queryKey: ['goals', userId],
    queryFn: () => fetchGoals(),
    enabled: Boolean(userId),
  });

  return (
    <AppShell>
      <h1 className="mb-2 text-4xl" style={{ fontFamily: 'var(--ef-font-display)' }}>
        Finance
      </h1>
      <p className="mb-8 text-[var(--ef-muted)]">
        Wallets, transactions, budgets, and goals for your account.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-[var(--ef-accent-soft)]">Wallets</h2>
        {walletsQuery.isLoading && <p className="text-[var(--ef-muted)]">Loading…</p>}
        {walletsQuery.data?.data.length === 0 && (
          <p className="text-[var(--ef-muted)]">No wallets yet. Create via Swagger / API.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {walletsQuery.data?.data.map((w) => (
            <div
              key={w.id}
              className="rounded-lg border border-[rgba(154,240,197,0.2)] bg-[rgba(12,31,26,0.55)] p-4"
            >
              <p className="font-medium">{w.name}</p>
              <p className="text-sm text-[var(--ef-muted)]">{w.type}</p>
              <p className="mt-2 text-xl">
                {w.balance} {w.currency}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-[var(--ef-accent-soft)]">
          Recent transactions
        </h2>
        {txQuery.data?.data.length === 0 && (
          <p className="text-[var(--ef-muted)]">No transactions yet.</p>
        )}
        <ul className="space-y-2">
          {txQuery.data?.data.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-md border border-[rgba(154,240,197,0.15)] px-4 py-3 text-sm"
            >
              <span>
                <span className="font-medium">{t.merchant ?? t.type}</span>
                <span className="ml-2 text-[var(--ef-muted)]">{t.type}</span>
              </span>
              <span>
                {t.amount} {t.currency}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--ef-accent-soft)]">Budgets</h2>
          <p className="text-sm text-[var(--ef-muted)]">
            {budgetsQuery.data?.meta?.total ?? 0} budgets
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-[var(--ef-accent-soft)]">Goals</h2>
          <p className="text-sm text-[var(--ef-muted)]">
            {goalsQuery.data?.meta?.total ?? 0} goals
          </p>
        </section>
      </div>
    </AppShell>
  );
}
