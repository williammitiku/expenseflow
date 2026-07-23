import { APP_NAME } from '@expenseflow/shared';
import { Link } from 'react-router-dom';
import { useUiStore } from '@/stores/ui.store';

export function LandingPage() {
  const darkMode = useUiStore((s) => s.darkMode);
  const setDarkMode = useUiStore((s) => s.setDarkMode);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-64 max-w-3xl rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--ef-accent), transparent 70%)' }}
      />

      <div className="ef-rise mb-8 flex items-center justify-between gap-4">
        <p className="text-sm font-medium tracking-[0.2em] uppercase text-[var(--ef-accent-soft)]">
          Personal finance, accelerated
        </p>
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-md border border-[rgba(154,240,197,0.25)] px-3 py-1.5 text-xs text-[var(--ef-muted)]"
        >
          {darkMode ? 'Dark' : 'Light'}
        </button>
      </div>

      <h1
        className="ef-rise-delay mb-4 text-5xl leading-none tracking-tight sm:text-7xl"
        style={{ fontFamily: 'var(--ef-font-display)' }}
      >
        {APP_NAME}
      </h1>

      <p className="ef-rise-delay-2 mb-10 max-w-xl text-lg text-[var(--ef-muted)]">
        Capture expenses in under three seconds with Telegram. Understand your money on a dashboard
        built for clarity.
      </p>

      <div className="ef-rise-delay-2 flex flex-wrap items-center gap-4">
        <Link
          to="/login"
          className="rounded-md bg-[var(--ef-accent)] px-5 py-3 text-sm font-semibold text-[#06281d] transition hover:brightness-110"
          style={{ animation: 'ef-pulse-soft 2.4s ease-in-out infinite' }}
        >
          Sign in
        </Link>
        <Link
          to="/health"
          className="rounded-md border border-[rgba(154,240,197,0.35)] px-5 py-3 text-sm font-medium text-[var(--ef-ink)] transition hover:border-[var(--ef-accent)]"
        >
          System health
        </Link>
      </div>
    </main>
  );
}
