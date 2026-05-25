import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/shared/lib/api";
import type { Registration } from "@/shared/lib/types";

export function useRegisterEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      api.post<Registration>(`/events/${eventId}/registrations`),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Registration created");
    },
  });
}
