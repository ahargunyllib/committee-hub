import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/shared/components/ui/input";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group";

import {
  isEventsFilterStatus,
  isEventsFilterType,
  useEventsFilterStore,
} from "../stores/use-events-filter-store";

export function EventsFilterBar() {
  const { filter, setSearch, setStatus, setType } = useEventsFilterStore();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative w-full sm:w-80">
        <HugeiconsIcon
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          icon={Search01Icon}
        />
        <Input
          className="pl-9"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Search by name, location, or id..."
          value={filter.search}
        />
      </div>
      <ToggleGroup
        onValueChange={(value) => {
          if (isEventsFilterStatus(value)) {
            setStatus(value);
          }
        }}
        type="single"
        value={filter.status}
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="open">Open</ToggleGroupItem>
        <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
        <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup
        onValueChange={(value) => {
          if (isEventsFilterType(value)) {
            setType(value);
          }
        }}
        type="single"
        value={filter.type}
      >
        <ToggleGroupItem value="all">All types</ToggleGroupItem>
        <ToggleGroupItem value="internal">Internal</ToggleGroupItem>
        <ToggleGroupItem value="external">External</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
