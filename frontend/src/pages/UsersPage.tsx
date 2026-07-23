import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { fetchUsers } from '@/services/users.api';

export function UsersPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers({ page: 1, limit: 20 }),
  });

  return (
    <AppShell>
      <h1 className="mb-2 text-4xl" style={{ fontFamily: 'var(--ef-font-display)' }}>
        Users
      </h1>
      <p className="mb-8 text-[var(--ef-muted)]">
        Internal user directory (protected by API key until JWT Auth).
      </p>

      {isLoading && <p className="text-[var(--ef-muted)]">Loading users…</p>}
      {isError && (
        <p className="text-red-300">
          {(error as Error).message}
          {!import.meta.env.VITE_INTERNAL_API_KEY &&
            ' — set VITE_INTERNAL_API_KEY in .env to match INTERNAL_API_KEY'}
        </p>
      )}

      {data && (
        <>
          <p className="mb-4 text-sm text-[var(--ef-muted)]">
            {data.meta.total} user{data.meta.total === 1 ? '' : 's'}
          </p>
          <div className="overflow-x-auto rounded-lg border border-[rgba(154,240,197,0.2)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[rgba(12,31,26,0.8)] text-[var(--ef-accent-soft)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Currency</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-[rgba(154,240,197,0.12)]"
                  >
                    <td className="px-4 py-3">
                      {user.firstName} {user.lastName ?? ''}
                      {user.username ? (
                        <span className="ml-2 text-[var(--ef-muted)]">
                          @{user.username}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-[var(--ef-muted)]">
                      {user.email ?? '—'}
                    </td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">{user.preferredCurrency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => void refetch()}
        className="mt-6 rounded-md border border-[rgba(154,240,197,0.35)] px-4 py-2 text-sm"
        disabled={isFetching}
      >
        {isFetching ? 'Refreshing…' : 'Refresh'}
      </button>
    </AppShell>
  );
}
