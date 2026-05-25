import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { Proposal } from "@/shared/lib/types";

export function useProposalDetail(proposalId: string | null) {
  return useQuery({
    enabled: !!proposalId,
    queryFn: () => api.get<Proposal | null>(`/proposals/${proposalId ?? ""}`),
    queryKey: ["proposals", "detail", proposalId],
  });
}
