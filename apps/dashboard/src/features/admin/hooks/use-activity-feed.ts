import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { ActivityEntry } from "@/shared/lib/types";

export function useActivityFeed() {
  return useQuery({
    queryFn: () => api.get<ActivityEntry[]>("/admin/activity"),
    queryKey: ["activity", "list"],
  });
}
