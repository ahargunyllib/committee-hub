import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { CommitteeApplication, Division } from "@/shared/lib/types";

type ApplicationSummary = {
  accepted: number;
  pending: number;
  total: number;
};

type ApplicationSummaryByDivision = Record<string, ApplicationSummary>;

const emptySummary: ApplicationSummary = {
  accepted: 0,
  pending: 0,
  total: 0,
};

export function useDivisionsApplicationSummary(divisions: Division[]) {
  const queries = useQueries({
    queries: divisions.map((division) => ({
      queryKey: ["applications", "list", division.id],
      queryFn: () =>
        api.get<CommitteeApplication[]>(
          `/committee/divisions/${division.id}/applications`
        ),
      enabled: divisions.length > 0,
    })),
  });

  return useMemo(() => {
    const summaries: ApplicationSummaryByDivision = {};
    for (const [index, division] of divisions.entries()) {
      const applications = queries[index]?.data ?? [];
      summaries[division.id] = {
        accepted: applications.filter(
          (application) => application.status === "accepted"
        ).length,
        pending: applications.filter(
          (application) => application.status === "pending"
        ).length,
        total: applications.length,
      };
    }

    return {
      summaries,
      getSummary: (divisionId: string): ApplicationSummary =>
        summaries[divisionId] ?? emptySummary,
      totalApplications: Object.values(summaries).reduce(
        (total, summary) => total + summary.total,
        0
      ),
      isPending: queries.some((query) => query.isPending),
    };
  }, [divisions, queries]);
}
