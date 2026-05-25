export function FillMeter({
  filled,
  quota,
}: {
  filled: number;
  quota: number;
}) {
  const pct = Math.min(100, (filled / Math.max(1, quota)) * 100);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs tabular-nums">
        {filled}/{quota}
      </span>
      <div className="h-1 w-16 overflow-hidden rounded bg-muted">
        <div
          className="h-full rounded bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
