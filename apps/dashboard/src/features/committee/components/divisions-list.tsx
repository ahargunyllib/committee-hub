import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { EmptyState } from "@/shared/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { formatRelative } from "@/shared/lib/format";
import type { Division } from "@/shared/lib/types";

import { FillMeter } from "./fill-meter";

type DivisionApplicationSummary = {
  accepted: number;
  pending: number;
  total: number;
};

type DivisionsListProps = {
  divisions: Division[];
  selectedId: string | null;
  isLead: boolean;
  onCreate: () => void;
  onSelect: (divisionId: string) => void;
  getSummary: (divisionId: string) => DivisionApplicationSummary;
};

export function DivisionsList({
  divisions,
  selectedId,
  isLead,
  onCreate,
  onSelect,
  getSummary,
}: DivisionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Divisions</CardTitle>
        <CardDescription>{divisions.length} for this event</CardDescription>
      </CardHeader>
      <CardContent>
        {divisions.length === 0 ? (
          <EmptyState
            action={
              isLead
                ? {
                    label: "Create division",
                    onClick: onCreate,
                  }
                : undefined
            }
            description={
              isLead
                ? "Create divisions like Event, Logistics, or Publication to start recruiting."
                : "The event lead has not published divisions yet."
            }
            icon={UserGroupIcon}
            title="No divisions yet"
          />
        ) : (
          <ul className="space-y-2">
            {divisions.map((division) => {
              const summary = getSummary(division.id);
              const selected = selectedId === division.id;

              return (
                <li key={division.id}>
                  <button
                    className={cn(
                      "grid w-full grid-cols-[1fr_auto] items-start gap-4 rounded-md border p-3 text-left transition-colors hover:bg-muted/50",
                      selected && "border-primary bg-primary/10"
                    )}
                    onClick={() => {
                      onSelect(division.id);
                    }}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{division.name}</span>
                      {division.description ? (
                        <span className="mt-1 block truncate text-muted-foreground text-xs">
                          {division.description}
                        </span>
                      ) : null}
                      <span className="mt-2 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                        <span className="inline-flex items-center gap-1">
                          <HugeiconsIcon
                            className="size-3"
                            icon={UserGroupIcon}
                          />
                          {summary.accepted}/{division.quota} filled
                        </span>
                        <span>
                          created {formatRelative(division.createdAt)}
                        </span>
                        <code className="font-mono text-[11px]">
                          {division.id}
                        </code>
                      </span>
                    </span>
                    <FillMeter
                      filled={summary.accepted}
                      quota={division.quota}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
