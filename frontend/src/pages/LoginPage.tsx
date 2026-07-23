import { FormEvent, useCallback, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { devLogin, telegramLogin } from '@/services/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import {
  TelegramLoginButton,
  type TelegramAuthUser,
} from '@/components/auth/TelegramLoginButton';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const existing = useAuthStore((s) => s.accessToken);
  const [email, setEmail] = useState('demo@expenseflow.local');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? '';

  const onTelegramAuth = useCallback(
    async (user: TelegramAuthUser) => {
      setLoading(true);
      setError(null);
      try {
        const payload: Record<string, string | number> = {
          id: user.id,
          auth_date: user.auth_date,
          hash: user.hash,
        };
        if (user.first_name) payload.first_name = user.first_name;
        if (user.last_name) payload.last_name = user.last_name;
        if (user.username) payload.username = user.username;
        if (user.photo_url) payload.photo_url = user.photo_url;

        const session = await telegramLogin(payload);
        setSession(session);
        navigate('/dashboard');
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [navigate, setSession],
  );

  if (existing) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const session = await devLogin(email);
      setSession(session);
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link to="/" className="mb-8 text-sm text-[var(--ef-accent-soft)] hover:underline">
        ← Home
      </Link>
      <h1 className="mb-2 text-4xl" style={{ fontFamily: 'var(--ef-font-display)' }}>
        Sign in
      </h1>
      <p className="mb-8 text-[var(--ef-muted)]">
        Continue with Telegram via @{botUsername || 'your_bot'}, or use demo login for local
        development.
      </p>

      {botUsername ? (
        <div className="mb-8 rounded-lg border border-[rgba(154,240,197,0.2)] bg-[rgba(12,31,26,0.55)] p-4">
          <p className="mb-3 text-center text-sm text-[var(--ef-accent-soft)]">
            Login with Telegram
          </p>
          <TelegramLoginButton botUsername={botUsername} onAuth={onTelegramAuth} />
          <p className="mt-3 text-center text-xs text-[var(--ef-muted)]">
            In BotFather run <code>/setdomain</code> for your site host. Localhost usually needs
            ngrok.
          </p>
        </div>
      ) : null}

      <div className="mb-4 text-center text-xs uppercase tracking-wide text-[var(--ef-muted)]">
        or
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--ef-muted)]">Dev email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-[rgba(154,240,197,0.25)] bg-[rgba(12,31,26,0.7)] px-3 py-2 outline-none focus:border-[var(--ef-accent)]"
            type="email"
            required
          />
        </label>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--ef-accent)] px-4 py-3 text-sm font-semibold text-[#06281d] disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Dev login'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[var(--ef-muted)]">
        Bot: <a className="text-[var(--ef-accent-soft)] hover:underline" href="https://t.me/expense_flow_manage_bot" target="_blank" rel="noreferrer">t.me/expense_flow_manage_bot</a>
      </p>
    </main>
  );
}
