const statusColor: Record<string, string> = {
  ok: 'bg-[var(--ef-accent)]',
  warning: 'bg-amber-400',
  critical: 'bg-orange-500',
  exceeded: 'bg-rose-500',
  complete: 'bg-[var(--ef-accent)]',
};

export function ProgressBar({
  percent,
  status = 'ok',
}: {
  percent: number;
  status?: string;
}) {
  const width = Math.min(Math.max(percent, 0), 100);
  const bar = statusColor[status] ?? statusColor.ok;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(154,240,197,0.12)]">
      <div
        className={`h-full rounded-full transition-all duration-500 ${bar}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
