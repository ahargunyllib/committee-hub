import { Location01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { EmptyState } from "@/shared/components/empty-state";
import { StatusBadge } from "@/shared/components/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { formatDateChip } from "@/shared/lib/format";
import type { Event } from "@/shared/lib/types";

export function UpcomingEventsList({ events }: { events: Event[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming events</CardTitle>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {events.length === 0 ? (
          <EmptyState icon={Location01Icon} title="No upcoming events" />
        ) : (
          events.map((event) => {
            const chip = formatDateChip(event.date);

            return (
              <div className="flex items-start gap-3 p-4" key={event.id}>
                <div className="grid size-11 flex-shrink-0 place-items-center rounded-md border bg-muted/50">
                  <span className="font-medium text-[9px] text-muted-foreground uppercase">
                    {chip.month}
                  </span>
                  <span className="font-semibold text-base leading-none">
                    {chip.day}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{event.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon className="size-3" icon={Location01Icon} />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon className="size-3" icon={UserGroupIcon} />
                      quota {event.quota}
                    </span>
                    <span className="font-mono text-muted-foreground/60">
                      {event.id}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge
                    label={event.type}
                    variant={event.type === "internal" ? "draft" : "info"}
                  />
                  <StatusBadge label={event.status} variant="success" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
