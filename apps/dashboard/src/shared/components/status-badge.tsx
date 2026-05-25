import { cn } from "@/shared/lib/utils";

export type StatusVariant = "draft" | "success" | "pending" | "danger" | "info";

const STYLES: Record<StatusVariant, string> = {
  danger:
    "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
  draft: "border-status-draft-border bg-status-draft-bg text-status-draft-fg",
  info: "border-status-info-border bg-status-info-bg text-status-info-fg",
  pending:
    "border-status-pending-border bg-status-pending-bg text-status-pending-fg",
  success:
    "border-status-success-border bg-status-success-bg text-status-success-fg",
};

export function StatusBadge({
  className,
  dot,
  label,
  variant,
}: {
  className?: string;
  dot?: boolean;
  label: string;
  variant: StatusVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-medium text-xs",
        STYLES[variant],
        className
      )}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current opacity-80" />
      ) : null}
      {label}
    </span>
  );
}
