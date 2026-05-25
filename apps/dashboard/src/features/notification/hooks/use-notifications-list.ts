import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { Notification } from "@/shared/lib/types";

export function useNotificationsList(
  userId: string | undefined,
  read?: boolean
) {
  return useQuery({
    queryKey: ["notifications", "list", { userId, read }],
    queryFn: () =>
      api.get<Notification[]>("/notifications", {
        read,
      }),
    enabled: Boolean(userId),
  });
}
