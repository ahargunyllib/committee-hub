import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/shared/lib/api";
import type { Event, EventStatus } from "@/shared/lib/types";

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      api.patch<Event>(`/events/${id}`, { status }),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event status updated");
    },
  });
}
