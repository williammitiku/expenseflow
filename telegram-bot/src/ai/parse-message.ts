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
  'deposit',
  'refund',
];

/** Common spend labels — higher confidence, less confirmation noise */
const EXPENSE_HINTS = [
  'coffee',
  'taxi',
  'uber',
  'food',
  'lunch',
  'dinner',
  'breakfast',
  'rent',
  'fuel',
  'gas',
  'grocery',
  'market',
  'netflix',
  'spotify',
  'transport',
  'bus',
  'water',
  'electric',
  'airtime',
  'data',
  'shop',
  'store',
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
 * Heuristic for keyboard-smash / nonsense merchants like "dshgfdbhdfj".
 */
export function looksUnclear(merchant: string): boolean {
  const letters = merchant.toLowerCase().replace(/[^a-z]/g, '');
  if (!letters || letters.length < 2) return true;
  if (letters === 'unknown') return true;

  const vowels = (letters.match(/[aeiou]/g) ?? []).length;
  const vowelRatio = vowels / letters.length;

  // Long strings with almost no vowels → likely gibberish
  if (letters.length >= 6 && vowelRatio < 0.22) return true;
  // Repeated characters
  if (/(.)\1{3,}/.test(letters)) return true;
  // Very short random codes without vowels
  if (letters.length >= 4 && vowels === 0) return true;

  return false;
}

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

  const amountMatch =
    cleaned.match(
      /(?:^|\s)(?:([$€£])\s*)?(\d+(?:[.,]\d{1,2})?)\s*([$€£]|usd|eur|gbp|etb|br|birr)?\b/i,
    ) ?? null;

  let amount = 0;
  let currency = defaultCurrency;
  let confidence = 0.35;

  if (amountMatch) {
    const symbolBefore = amountMatch[1];
    const rawAmount = amountMatch[2].replace(',', '.');
    const symbolAfter = amountMatch[3];
    amount = Number(rawAmount);
    const currKey = (symbolBefore || symbolAfter || '').toLowerCase();
    if (currKey && CURRENCY_MAP[currKey]) {
      currency = CURRENCY_MAP[currKey];
    }
    confidence = 0.7;
  }

  const amountToken = amountMatch?.[0]?.trim() ?? '';
  let merchant = cleaned
    .replace(amountToken, '')
    .replace(/\b(paid|bought|spent|for|on|at)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!merchant) {
    merchant = 'Unknown';
    confidence = Math.min(confidence, 0.45);
  }

  const isIncome = INCOME_KEYWORDS.some((k) => lower.includes(k));
  const hasExpenseHint = EXPENSE_HINTS.some((k) => lower.includes(k));
  const type = isIncome ? TransactionType.INCOME : TransactionType.EXPENSE;
  const unclear = looksUnclear(merchant);

  if (isIncome) {
    confidence = Math.max(confidence, 0.9);
  } else if (hasExpenseHint && !unclear) {
    confidence = Math.max(confidence, 0.88);
  } else if (unclear) {
    // Force confirmation for gibberish / ambiguous labels
    confidence = Math.min(confidence, 0.55);
  } else {
    // Recognizable words but not in our hint lists — still confirm type
    confidence = Math.min(confidence, 0.72);
  }

  if (!(amount > 0)) confidence = 0.25;

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
  return (
    draft.confidence < NLP_CONFIRMATION_THRESHOLD ||
    !(draft.amount > 0) ||
    looksUnclear(draft.merchant ?? '')
  );
}
