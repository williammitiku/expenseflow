import { AuthService } from './auth.service';
import { verifyTelegramAuth, hashToken, parseDurationToMs } from './auth.crypto';
import { createHash, createHmac } from 'crypto';

describe('auth.crypto', () => {
  it('hashes tokens deterministically', () => {
    expect(hashToken('abc')).toBe(hashToken('abc'));
    expect(hashToken('abc')).not.toBe(hashToken('abcd'));
  });

  it('parses durations', () => {
    expect(parseDurationToMs('15m')).toBe(15 * 60 * 1000);
    expect(parseDurationToMs('2d')).toBe(2 * 86_400_000);
  });

  it('verifies a valid Telegram payload', () => {
    const botToken = '123456:ABC-DEF';
    const payload: Record<string, string | number> = {
      id: 42,
      first_name: 'Ada',
      auth_date: Math.floor(Date.now() / 1000),
    };
    const dataCheckString = Object.keys(payload)
      .sort()
      .map((k) => `${k}=${payload[k]}`)
      .join('\n');
    const secretKey = createHash('sha256').update(botToken).digest();
    const hash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    expect(verifyTelegramAuth({ ...payload, hash }, botToken)).toBe(true);
    expect(verifyTelegramAuth({ ...payload, hash: '00'.repeat(32) }, botToken)).toBe(
      false,
    );
  });
});

describe('AuthService.validateAccessPayload shape', () => {
  it('exports AuthService', () => {
    expect(AuthService).toBeDefined();
  });
});
