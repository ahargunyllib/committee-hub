import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { CommitteeApplication } from "@/shared/lib/types";

export function useDivisionApplications(divisionId: string | null | undefined) {
  return useQuery({
    queryKey: ["applications", "list", divisionId],
    queryFn: () =>
      api.get<CommitteeApplication[]>(
        `/committee/divisions/${divisionId ?? ""}/applications`
      ),
    enabled: Boolean(divisionId),
  });
}
