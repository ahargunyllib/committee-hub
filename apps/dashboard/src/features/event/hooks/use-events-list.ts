import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { Event } from "@/shared/lib/types";

import { useEventsFilterStore } from "../stores/use-events-filter-store";

export function useEventsList() {
  const filter = useEventsFilterStore((state) => state.filter);
  const params = {
    search: filter.search || undefined,
    status: filter.status === "all" ? undefined : filter.status,
    type: filter.type === "all" ? undefined : filter.type,
  };

  return useQuery({
    queryFn: () => api.get<Event[]>("/events", params),
    queryKey: ["events", "list", params],
  });
}
