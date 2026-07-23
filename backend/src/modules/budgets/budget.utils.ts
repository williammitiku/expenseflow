import { BudgetPeriod } from '@expenseflow/shared';

function parseDateOnly(dateOnly: string): Date {
  const [y, m, day] = dateOnly.split('-').map(Number);
  return new Date(y, m - 1, day, 0, 0, 0, 0);
}

export function budgetPeriodRange(
  period: BudgetPeriod,
  startDate: string,
  now = new Date(),
): { from: Date; to: Date } {
  const to = new Date(now);
  let from = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === BudgetPeriod.WEEKLY) {
    const day = from.getDay();
    const diff = day === 0 ? 6 : day - 1;
    from.setDate(from.getDate() - diff);
  } else if (period === BudgetPeriod.YEARLY) {
    from = new Date(from.getFullYear(), 0, 1);
  } else {
    from = new Date(from.getFullYear(), from.getMonth(), 1);
  }

  const budgetStart = parseDateOnly(startDate);
  if (budgetStart > from) {
    return { from: budgetStart, to };
  }
  return { from, to };
}

export function budgetStatus(
  percentUsed: number,
  thresholds: number[],
): 'ok' | 'warning' | 'critical' | 'exceeded' {
  if (percentUsed >= 100) return 'exceeded';
  const sorted = [...thresholds].sort((a, b) => a - b);
  const hit = sorted.filter((t) => percentUsed >= t);
  const highest = hit[hit.length - 1] ?? 0;
  if (highest >= 90) return 'critical';
  if (highest >= 75) return 'warning';
  if (highest >= 50) return 'warning';
  return 'ok';
}

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const end = parseDateOnly(deadline);
  end.setHours(23, 59, 59, 999);
  const ms = end.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
