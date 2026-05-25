import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { ProposalApproval } from "@/shared/lib/types";

export function useProposalApprovals(proposalId: string | null) {
  return useQuery({
    enabled: !!proposalId,
    queryFn: () =>
      api.get<ProposalApproval[]>(`/proposals/${proposalId ?? ""}/approvals`),
    queryKey: ["proposals", "approvals", proposalId],
  });
}
