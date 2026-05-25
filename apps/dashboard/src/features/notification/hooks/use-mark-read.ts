import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/shared/lib/api";
import type { Notification } from "@/shared/lib/types";

type MarkReadInput = {
  id: string;
  userId: string;
};

export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: MarkReadInput) =>
      api.patch<Notification>(`/notifications/${id}/read`, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark notification read");
    },
  });
}
