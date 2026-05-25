import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { Event } from "@/shared/lib/types";

export function useNonClosedEvents() {
  return useQuery({
    queryKey: ["events", "list", { status: "non-closed" }],
    queryFn: async () => {
      const events = await api.get<Event[]>("/events");
      return events.filter((event) => event.status !== "closed");
    },
  });
}
