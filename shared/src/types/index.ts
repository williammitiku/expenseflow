import type {
  BudgetPeriod,
  CategoryType,
  SubscriptionPlan,
  TransactionType,
  WalletMemberRole,
  WalletType,
} from '../enums';

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface MoneyAmount {
  amount: string;
  currency: string;
}

/** Structured draft produced by the NLP / AI parser */
export interface TransactionDraft {
  type: TransactionType;
  amount: number;
  currency: string;
  merchant?: string;
  categoryHint?: string;
  note?: string;
  occurredAt?: string;
  confidence: number;
}

export interface WalletSummary {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  balance: string;
  isShared: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface BudgetSummary {
  id: string;
  name: string;
  period: BudgetPeriod;
  amount: string;
  spent: string;
  currency: string;
}

export interface Entitlements {
  plan: SubscriptionPlan;
  advancedAnalytics: boolean;
  ocr: boolean;
  aiInsights: boolean;
  unlimitedSharedWallets: boolean;
  unlimitedBudgets: boolean;
  unlimitedGoals: boolean;
  export: boolean;
  prioritySupport: boolean;
}

export interface SharedWalletPermission {
  walletId: string;
  role: WalletMemberRole;
}
