import { SubscriptionPlan } from '../enums';
import type { Entitlements } from '../types';

export function getEntitlements(plan: SubscriptionPlan): Entitlements {
  const isPremium = plan === SubscriptionPlan.PREMIUM;

  return {
    plan,
    advancedAnalytics: isPremium,
    ocr: isPremium,
    aiInsights: isPremium,
    unlimitedSharedWallets: isPremium,
    unlimitedBudgets: isPremium,
    unlimitedGoals: isPremium,
    export: isPremium,
    prioritySupport: isPremium,
  };
}

export function isValidCurrencyCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

export function roundMoney(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
