import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { User } from "@/shared/lib/types";

export function useUsersList() {
  return useQuery({
    queryFn: () => api.get<User[]>("/admin/users"),
    queryKey: ["users", "list"],
  });
}
