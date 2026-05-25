import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/shared/lib/api";
import type { Proposal } from "@/shared/lib/types";

export function useResubmitProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposalId: string) =>
      api.post<Proposal>(`/proposals/${proposalId}/submit`),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resubmit proposal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal resubmitted");
    },
  });
}
