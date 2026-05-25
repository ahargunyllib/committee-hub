import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";

import { useNonClosedEvents } from "../hooks/use-non-closed-events";
import { useSelectedEventStore } from "../stores/use-selected-event-store";

type EventSelectorProps = {
  divisionCount: number;
  applicationCount: number;
};

function eventStatusVariant(status: "draft" | "open" | "closed") {
  if (status === "open") {
    return "success";
  }
  return "draft";
}

export function EventSelector({
  divisionCount,
  applicationCount,
}: EventSelectorProps) {
  const { data: events } = useNonClosedEvents();
  const id = useSelectedEventStore((state) => state.id);
  const setId = useSelectedEventStore((state) => state.setId);
  const selected = events?.find((event) => event.id === id);

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-end md:justify-between">
      <div className="w-full max-w-[340px] space-y-1.5">
        <Label htmlFor="committee-event">Event</Label>
        <Select
          onValueChange={(value) => {
            setId(value || null);
          }}
          value={id ?? ""}
        >
          <SelectTrigger className="w-full" id="committee-event">
            <SelectValue placeholder="Choose event" />
          </SelectTrigger>
          <SelectContent>
            {(events ?? []).map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.id} - {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected ? (
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Badge variant="secondary">{divisionCount} divisions</Badge>
          <Badge variant="secondary">{applicationCount} applications</Badge>
          <StatusBadge
            label={selected.status}
            variant={eventStatusVariant(selected.status)}
          />
        </div>
      ) : null}
    </div>
  );
}
