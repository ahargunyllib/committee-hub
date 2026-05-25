import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Button } from "@/shared/components/ui/button";

export function EmptyState({
  action,
  description,
  icon,
  title,
}: {
  action?: { label: string; onClick: () => void };
  description?: string;
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
      <div className="grid size-12 place-items-center rounded-lg bg-muted">
        <HugeiconsIcon className="size-6 text-muted-foreground" icon={icon} />
      </div>
      <h3 className="font-medium">{title}</h3>
      {description ? (
        <p className="max-w-sm text-muted-foreground text-sm">{description}</p>
      ) : null}
      {action ? (
        <Button onClick={action.onClick} size="sm" variant="ghost">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
