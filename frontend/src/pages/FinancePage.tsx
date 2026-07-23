import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WalletType, BudgetPeriod, TransactionType } from '@expenseflow/shared';
import { AppShell } from '@/components/layout/AppShell';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAuthStore } from '@/stores/auth.store';
import {
  contributeGoal,
  createBudget,
  createGoal,
  createTransaction,
  createWallet,
  deleteBudget,
  deleteGoal,
  fetchBudgets,
  fetchGoals,
  fetchTransactions,
  fetchWallets,
} from '@/services/finance.api';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function FinancePage() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['wallets'] });
    void qc.invalidateQueries({ queryKey: ['transactions'] });
    void qc.invalidateQueries({ queryKey: ['budgets'] });
    void qc.invalidateQueries({ queryKey: ['goals'] });
    void qc.invalidateQueries({ queryKey: ['analytics'] });
  };

  const walletsQuery = useQuery({
    queryKey: ['wallets', userId],
    queryFn: fetchWallets,
    enabled: Boolean(userId),
  });
  const txQuery = useQuery({
    queryKey: ['transactions', userId],
    queryFn: fetchTransactions,
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

  const [error, setError] = useState<string | null>(null);

  const walletMut = useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      invalidate();
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });
  const txMut = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      invalidate();
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });
  const budgetMut = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      invalidate();
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });
  const goalMut = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      invalidate();
      setError(null);
    },
    onError: (e: Error) => setError(e.message),
  });

  const wallets = walletsQuery.data?.data ?? [];
  const defaultWalletId = wallets[0]?.id ?? '';

  async function onCreateWallet(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await walletMut.mutateAsync({
      name: String(fd.get('name') || 'Cash'),
      type: String(fd.get('type') || WalletType.CASH),
      currency: String(fd.get('currency') || 'ETB'),
      balance: String(fd.get('balance') || '0'),
    });
    e.currentTarget.reset();
  }

  async function onCreateTx(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const walletId = String(fd.get('walletId') || defaultWalletId);
    if (!walletId) {
      setError('Create a wallet first');
      return;
    }
    await txMut.mutateAsync({
      walletId,
      type: String(fd.get('type') || TransactionType.EXPENSE),
      amount: Number(fd.get('amount')),
      merchant: String(fd.get('merchant') || '') || undefined,
      note: String(fd.get('note') || '') || undefined,
    });
    e.currentTarget.reset();
  }

  async function onCreateBudget(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await budgetMut.mutateAsync({
      name: String(fd.get('name') || 'Budget'),
      period: String(fd.get('period') || BudgetPeriod.MONTHLY),
      amount: Number(fd.get('amount')),
      walletId: String(fd.get('walletId') || '') || undefined,
      startDate: String(fd.get('startDate') || todayIsoDate()),
      currency: 'ETB',
    });
    e.currentTarget.reset();
  }

  async function onCreateGoal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await goalMut.mutateAsync({
      name: String(fd.get('name') || 'Goal'),
      targetAmount: Number(fd.get('targetAmount')),
      currentAmount: Number(fd.get('currentAmount') || 0),
      deadline: String(fd.get('deadline') || '') || undefined,
      walletId: String(fd.get('walletId') || '') || undefined,
      currency: 'ETB',
    });
    e.currentTarget.reset();
  }

  return (
    <AppShell>
      <h1 className="mb-2 text-4xl" style={{ fontFamily: 'var(--ef-font-display)' }}>
        Finance
      </h1>
      <p className="mb-6 text-[var(--ef-muted)]">
        Manage wallets, expenses, budgets, and savings goals in one place.
      </p>

      {error && (
        <p className="mb-4 rounded-md border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--ef-accent-soft)]">Wallets</h2>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {wallets.map((w) => (
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
          {!wallets.length && (
            <p className="text-sm text-[var(--ef-muted)]">No wallets yet — create one below.</p>
          )}
        </div>
        <form
          onSubmit={(e) => void onCreateWallet(e)}
          className="grid gap-2 rounded-lg border border-[rgba(154,240,197,0.15)] p-4 sm:grid-cols-4"
        >
          <input name="name" placeholder="Wallet name" className="ef-input" required />
          <select name="type" className="ef-input" defaultValue={WalletType.CASH}>
            {Object.values(WalletType).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input name="balance" type="number" step="0.01" placeholder="Opening balance" className="ef-input" />
          <button type="submit" className="ef-btn" disabled={walletMut.isPending}>
            Add wallet
          </button>
        </form>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-[var(--ef-accent-soft)]">Add transaction</h2>
        <form
          onSubmit={(e) => void onCreateTx(e)}
          className="grid gap-2 rounded-lg border border-[rgba(154,240,197,0.15)] p-4 sm:grid-cols-5"
        >
          <select name="walletId" className="ef-input" defaultValue={defaultWalletId} required>
            <option value="">Wallet…</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select name="type" className="ef-input" defaultValue={TransactionType.EXPENSE}>
            <option value={TransactionType.EXPENSE}>Expense</option>
            <option value={TransactionType.INCOME}>Income</option>
          </select>
          <input name="amount" type="number" step="0.01" min="0.01" placeholder="Amount" className="ef-input" required />
          <input name="merchant" placeholder="Merchant / label" className="ef-input" />
          <button type="submit" className="ef-btn" disabled={txMut.isPending}>
            Save
          </button>
        </form>

        <h3 className="mt-6 mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--ef-muted)]">
          Recent
        </h3>
        <ul className="space-y-2">
          {(txQuery.data?.data ?? []).map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-md border border-[rgba(154,240,197,0.15)] px-4 py-3 text-sm"
            >
              <span>
                <span className="font-medium">{t.merchant ?? t.type}</span>
                <span className="ml-2 text-[var(--ef-muted)]">{t.type}</span>
              </span>
              <span>
                {t.type === 'income' ? '+' : '-'}
                {t.amount} {t.currency}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-[var(--ef-accent-soft)]">Budgets</h2>
        <div className="mb-4 space-y-3">
          {(budgetsQuery.data?.data ?? []).map((b) => (
            <div
              key={b.id}
              className="rounded-lg border border-[rgba(154,240,197,0.2)] bg-[rgba(12,31,26,0.55)] p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-[var(--ef-muted)]">
                    {b.period} · {b.spent} / {b.amount} {b.currency} · {b.status}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs text-rose-300 hover:underline"
                  onClick={() =>
                    void deleteBudget(b.id).then(invalidate).catch((e: Error) => setError(e.message))
                  }
                >
                  Delete
                </button>
              </div>
              <ProgressBar percent={b.percentUsed} status={b.status} />
              <p className="mt-2 text-xs text-[var(--ef-muted)]">
                {b.percentUsed}% used · {b.remaining} left
              </p>
            </div>
          ))}
          {!budgetsQuery.data?.data.length && (
            <p className="text-sm text-[var(--ef-muted)]">No budgets yet.</p>
          )}
        </div>
        <form
          onSubmit={(e) => void onCreateBudget(e)}
          className="grid gap-2 rounded-lg border border-[rgba(154,240,197,0.15)] p-4 sm:grid-cols-5"
        >
          <input name="name" placeholder="Budget name" className="ef-input" required />
          <select name="period" className="ef-input" defaultValue={BudgetPeriod.MONTHLY}>
            {Object.values(BudgetPeriod).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input name="amount" type="number" step="0.01" min="0.01" placeholder="Limit" className="ef-input" required />
          <input name="startDate" type="date" defaultValue={todayIsoDate()} className="ef-input" />
          <button type="submit" className="ef-btn" disabled={budgetMut.isPending}>
            Add budget
          </button>
        </form>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--ef-accent-soft)]">Goals</h2>
        <div className="mb-4 space-y-3">
          {(goalsQuery.data?.data ?? []).map((g) => (
            <div
              key={g.id}
              className="rounded-lg border border-[rgba(154,240,197,0.2)] bg-[rgba(12,31,26,0.55)] p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {g.name} {g.isComplete ? '✓' : ''}
                  </p>
                  <p className="text-xs text-[var(--ef-muted)]">
                    {g.currentAmount} / {g.targetAmount} {g.currency}
                    {g.daysLeft != null ? ` · ${g.daysLeft}d left` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs text-rose-300 hover:underline"
                  onClick={() =>
                    void deleteGoal(g.id).then(invalidate).catch((e: Error) => setError(e.message))
                  }
                >
                  Delete
                </button>
              </div>
              <ProgressBar
                percent={g.percentComplete}
                status={g.isComplete ? 'complete' : 'ok'}
              />
              <form
                className="mt-3 flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  void contributeGoal(g.id, {
                    amount: Number(fd.get('amount')),
                    walletId: defaultWalletId || undefined,
                  })
                    .then(() => {
                      invalidate();
                      e.currentTarget.reset();
                    })
                    .catch((err: Error) => setError(err.message));
                }}
              >
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Contribute"
                  className="ef-input max-w-[140px]"
                  required
                />
                <button type="submit" className="ef-btn">
                  Add savings
                </button>
              </form>
            </div>
          ))}
          {!goalsQuery.data?.data.length && (
            <p className="text-sm text-[var(--ef-muted)]">No goals yet.</p>
          )}
        </div>
        <form
          onSubmit={(e) => void onCreateGoal(e)}
          className="grid gap-2 rounded-lg border border-[rgba(154,240,197,0.15)] p-4 sm:grid-cols-5"
        >
          <input name="name" placeholder="Goal name" className="ef-input" required />
          <input
            name="targetAmount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Target"
            className="ef-input"
            required
          />
          <input
            name="currentAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Already saved"
            className="ef-input"
          />
          <input name="deadline" type="date" className="ef-input" />
          <button type="submit" className="ef-btn" disabled={goalMut.isPending}>
            Add goal
          </button>
        </form>
      </section>
    </AppShell>
  );
}
