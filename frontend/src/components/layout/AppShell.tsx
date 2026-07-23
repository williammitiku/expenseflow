import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@expenseflow/shared';
import { useUiStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { logoutAuth } from '@/services/auth.api';

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/finance', label: 'Finance' },
  { to: '/users', label: 'Users' },
  { to: '/health', label: 'Health' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const darkMode = useUiStore((s) => s.darkMode);
  const setDarkMode = useUiStore((s) => s.setDarkMode);
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);

  async function onLogout() {
    try {
      if (refreshToken) await logoutAuth(refreshToken);
    } catch {
      // ignore network errors on logout
    }
    clearSession();
    navigate('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[rgba(154,240,197,0.12)] bg-[rgba(8,20,16,0.55)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link
            to="/dashboard"
            className="text-xl tracking-tight text-[var(--ef-ink)]"
            style={{ fontFamily: 'var(--ef-font-display)' }}
          >
            {APP_NAME}
          </Link>

          <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
            {nav.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    active
                      ? 'bg-[rgba(62,207,142,0.18)] text-[var(--ef-accent-soft)]'
                      : 'text-[var(--ef-muted)] hover:text-[var(--ef-ink)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {user && (
              <span className="ml-2 hidden text-xs text-[var(--ef-muted)] sm:inline">
                {user.firstName}
              </span>
            )}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="ml-1 rounded-md border border-[rgba(154,240,197,0.25)] px-3 py-1.5 text-xs text-[var(--ef-muted)]"
            >
              {darkMode ? 'Dark' : 'Light'}
            </button>
            {user && (
              <button
                type="button"
                onClick={() => void onLogout()}
                className="rounded-md border border-[rgba(154,240,197,0.25)] px-3 py-1.5 text-xs text-[var(--ef-muted)]"
              >
                Log out
              </button>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
