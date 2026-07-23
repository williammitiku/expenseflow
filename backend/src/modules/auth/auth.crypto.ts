import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

/** Hash refresh tokens at rest (SHA-256 hex). */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

/**
 * Verify Telegram Login Widget / Login URL payload.
 * @see https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramAuth(
  payload: Record<string, string | number | undefined>,
  botToken: string,
  maxAgeSeconds = 86400,
): boolean {
  const hash = String(payload.hash ?? '');
  if (!hash || !botToken) {
    return false;
  }

  const dataCheckString = Object.keys(payload)
    .filter((key) => key !== 'hash' && payload[key] !== undefined && payload[key] !== null)
    .sort()
    .map((key) => `${key}=${payload[key]}`)
    .join('\n');

  const secretKey = createHash('sha256').update(botToken).digest();
  const computed = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return false;
  }

  const authDate = Number(payload.auth_date);
  if (!Number.isFinite(authDate)) {
    return false;
  }

  const age = Math.floor(Date.now() / 1000) - authDate;
  return age <= maxAgeSeconds;
}

/** Parse durations like 15m, 7d, 30d into milliseconds. */
export function parseDurationToMs(input: string): number {
  const match = /^(\d+)([smhd])$/i.exec(input.trim());
  if (!match) {
    return 15 * 60 * 1000;
  }
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const map: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (map[unit] ?? 60_000);
}
