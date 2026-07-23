/** Budget alert thresholds as percentages of limit */
export const BUDGET_ALERT_THRESHOLDS = [50, 75, 90, 100] as const;

export const DEFAULT_CURRENCY = 'ETB';
export const DEFAULT_TIMEZONE = 'Africa/Addis_Ababa';

export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

/** Confidence below this triggers Telegram confirmation before save */
export const NLP_CONFIRMATION_THRESHOLD = 0.75;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const JWT = {
  ACCESS_TTL_DEFAULT: '15m',
  REFRESH_TTL_DEFAULT: '30d',
} as const;

export const QUEUE_NAMES = {
  AI: 'ai',
  OCR: 'ocr',
  NOTIFICATIONS: 'notifications',
  EXPORTS: 'exports',
  REPORTS: 'reports',
  BILLING: 'billing',
} as const;

export const SUPPORTED_CURRENCIES = [
  'ETB',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'KES',
] as const;

export const APP_NAME = 'ExpenseFlow';
