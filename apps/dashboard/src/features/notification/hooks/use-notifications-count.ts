import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import { useSession } from "@/shared/lib/auth";
import type { Notification } from "@/shared/lib/types";

export function useNotificationsCount(): number {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const { data } = useQuery({
    queryKey: ["notifications", "list", { userId, read: false }],
    queryFn: () =>
      api.get<Notification[]>("/notifications", {
        userId: userId ?? "",
        read: false,
      }),
    enabled: Boolean(userId),
    refetchInterval: 30_000,
  });

  return data?.length ?? 0;
}
