import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/shared/lib/api";
import type {
  ProposalApproval,
  ProposalDecision,
  ProposalScope,
} from "@/shared/lib/types";

type ReviewProposalInput = {
  decision: ProposalDecision;
  level: ProposalScope;
  notes?: string;
  reviewerId: string;
};

export function useReviewProposal(proposalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ReviewProposalInput) =>
      api.post<ProposalApproval>(`/proposals/${proposalId}/reviews`, body),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to record decision");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Decision recorded");
    },
  });
}
