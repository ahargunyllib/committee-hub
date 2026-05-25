import type { ReactNode } from "react";

import { Card } from "@/shared/components/ui/card";

export function StatTile({
  delta,
  foot,
  label,
  trailing,
  value,
}: {
  delta?: ReactNode;
  foot?: ReactNode;
  label: string;
  trailing?: ReactNode;
  value: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </span>
        {trailing}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-semibold text-3xl tabular-nums tracking-tight">
          {value}
        </span>
        {delta ? (
          <span className="text-muted-foreground text-xs">{delta}</span>
        ) : null}
      </div>
      {foot ? (
        <p className="mt-2 text-muted-foreground text-xs">{foot}</p>
      ) : null}
    </Card>
  );
}
