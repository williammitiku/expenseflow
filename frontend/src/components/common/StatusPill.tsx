export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'good' | 'warn' | 'bad';
}) {
  const colors = {
    good: 'bg-[rgba(62,207,142,0.18)] text-[var(--ef-accent-soft)] border-[rgba(62,207,142,0.35)]',
    warn: 'bg-[rgba(245,198,84,0.15)] text-[#f5d67a] border-[rgba(245,198,84,0.35)]',
    bad: 'bg-[rgba(239,68,68,0.15)] text-[#fca5a5] border-[rgba(239,68,68,0.35)]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${colors[tone]}`}
    >
      {label}
    </span>
  );
}
