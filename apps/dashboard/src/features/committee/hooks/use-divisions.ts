import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { Division } from "@/shared/lib/types";

export function useDivisions(eventId: string | null | undefined) {
  return useQuery({
    queryKey: ["divisions", "list", eventId],
    queryFn: () =>
      api.get<Division[]>(`/committee/events/${eventId ?? ""}/divisions`),
    enabled: Boolean(eventId),
  });
}
