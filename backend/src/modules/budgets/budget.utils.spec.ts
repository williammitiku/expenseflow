import { BudgetPeriod } from '@expenseflow/shared';
import { budgetPeriodRange, budgetStatus, daysUntil } from './budget.utils';

describe('budgetPeriodRange', () => {
  it('clamps window to budget startDate when later than period start', () => {
    const now = new Date(2026, 6, 23, 12, 0, 0);
    const { from } = budgetPeriodRange(BudgetPeriod.MONTHLY, '2026-07-15', now);
    expect(from.getFullYear()).toBe(2026);
    expect(from.getMonth()).toBe(6);
    expect(from.getDate()).toBe(15);
  });
});

describe('budgetStatus', () => {
  it('marks exceeded at 100%+', () => {
    expect(budgetStatus(100, [50, 75, 90, 100])).toBe('exceeded');
  });

  it('marks critical near 90', () => {
    expect(budgetStatus(91, [50, 75, 90, 100])).toBe('critical');
  });
});

describe('daysUntil', () => {
  it('returns null without deadline', () => {
    expect(daysUntil(null)).toBeNull();
  });
});
