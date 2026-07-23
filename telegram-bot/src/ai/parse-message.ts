import {
  NLP_CONFIRMATION_THRESHOLD,
  TransactionType,
  type TransactionDraft,
} from '@expenseflow/shared';

const INCOME_KEYWORDS = [
  'salary',
  'bonus',
  'freelance',
  'gift',
  'interest',
  'income',
  'paycheck',
  'wage',
];

const CURRENCY_MAP: Record<string, string> = {
  $: 'USD',
  usd: 'USD',
  '€': 'EUR',
  eur: 'EUR',
  '£': 'GBP',
  gbp: 'GBP',
  etb: 'ETB',
  br: 'ETB',
  birr: 'ETB',
};

/**
 * Fast rule-based NL parser for messages like:
 * "Coffee 250", "Taxi 450", "Netflix 12$", "Salary 45000", "Paid rent 18000"
 */
export function parseExpenseMessage(
  text: string,
  defaultCurrency = 'ETB',
): TransactionDraft {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const lower = cleaned.toLowerCase();

  // Amount patterns: 250, 12$, $12, 12.50, 12,50, 3000usd
  const amountMatch =
    cleaned.match(
      /(?:^|\s)(?:([$€£])\s*)?(\d+(?:[.,]\d{1,2})?)\s*([$€£]|usd|eur|gbp|etb|br|birr)?\b/i,
    ) ?? null;

  let amount = 0;
  let currency = defaultCurrency;
  let confidence = 0.4;

  if (amountMatch) {
    const symbolBefore = amountMatch[1];
    const rawAmount = amountMatch[2].replace(',', '.');
    const symbolAfter = amountMatch[3];
    amount = Number(rawAmount);
    const currKey = (symbolBefore || symbolAfter || '').toLowerCase();
    if (currKey && CURRENCY_MAP[currKey]) {
      currency = CURRENCY_MAP[currKey];
    }
    confidence = 0.85;
  }

  const amountToken = amountMatch?.[0]?.trim() ?? '';
  let merchant = cleaned
    .replace(amountToken, '')
    .replace(/\b(paid|bought|spent|for|on|at)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!merchant) {
    merchant = 'Unknown';
    confidence = Math.min(confidence, 0.55);
  } else {
    confidence = Math.max(confidence, 0.8);
  }

  const isIncome = INCOME_KEYWORDS.some((k) => lower.includes(k));
  const type = isIncome ? TransactionType.INCOME : TransactionType.EXPENSE;

  if (isIncome) confidence = Math.max(confidence, 0.88);
  if (!(amount > 0)) confidence = 0.3;

  return {
    type,
    amount,
    currency,
    merchant: merchant.replace(/^./, (c) => c.toUpperCase()),
    note: cleaned,
    confidence,
    categoryHint: isIncome ? 'income' : undefined,
  };
}

export function needsConfirmation(draft: TransactionDraft): boolean {
  return draft.confidence < NLP_CONFIRMATION_THRESHOLD || !(draft.amount > 0);
}
