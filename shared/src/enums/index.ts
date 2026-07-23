export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer',
  REFUND = 'refund',
}

export enum WalletType {
  CASH = 'cash',
  BANK = 'bank',
  TELEBIRR = 'telebirr',
  CBE = 'cbe',
  DASHEN = 'dashen',
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  CRYPTO = 'crypto',
  OTHER = 'other',
}

export enum WalletMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum CategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
  BOTH = 'both',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
}

export enum NotificationChannel {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
  PDF = 'pdf',
}

export enum JobStatus {
  PENDING = 'pending',
  READY = 'ready',
  FAILED = 'failed',
}

export enum IncomeCategory {
  SALARY = 'salary',
  BONUS = 'bonus',
  GIFT = 'gift',
  INVESTMENT = 'investment',
  FREELANCE = 'freelance',
  INTEREST = 'interest',
  OTHER = 'other',
}

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}
