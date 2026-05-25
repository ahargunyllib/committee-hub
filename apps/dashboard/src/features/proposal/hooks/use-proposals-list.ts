import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { Proposal } from "@/shared/lib/types";

import { useProposalsFilterStore } from "../stores/use-proposals-filter-store";

export function useProposalsList() {
  const filter = useProposalsFilterStore((state) => state.filter);
  const params = {
    scope: filter.scope === "all" ? undefined : filter.scope,
    status: filter.status === "all" ? undefined : filter.status,
  };

  return useQuery({
    queryFn: async () => {
      const proposals = await api.get<Proposal[]>("/proposals", params);
      const search = filter.search.trim().toLowerCase();
      if (!search) {
        return proposals;
      }
      return proposals.filter(
        (proposal) =>
          proposal.title.toLowerCase().includes(search) ||
          proposal.id.toLowerCase().includes(search) ||
          proposal.eventId.toLowerCase().includes(search)
      );
    },
    queryKey: ["proposals", "list", { ...params, search: filter.search }],
  });
}
