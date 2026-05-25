import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { SystemConfig } from "@/shared/lib/types";

export function useConfigList() {
  return useQuery({
    queryFn: () => api.get<SystemConfig[]>("/admin/config"),
    queryKey: ["config", "list"],
  });
}
