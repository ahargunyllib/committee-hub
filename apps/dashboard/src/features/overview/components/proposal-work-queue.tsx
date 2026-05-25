import { FileEditIcon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelative } from "@/shared/lib/format";
import type { Proposal } from "@/shared/lib/types";
import { titleCase } from "@/shared/lib/string";

import { proposalStatusVariant } from "@/features/proposal/utils/variant-mapper";

export function ProposalWorkQueue({ items }: { items: Proposal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal work queue</CardTitle>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {items.length === 0 ? (
          <EmptyState icon={FileEditIcon} title="Nothing waiting" />
        ) : (
          items.map((proposal) => (
            <div className="flex items-start gap-3 p-4" key={proposal.id}>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{proposal.title}</div>
                <p className="mt-1 text-muted-foreground text-xs">
                  <span className="font-mono">{proposal.id}</span> ·{" "}
                  {titleCase(proposal.scope)} · round {proposal.submissionRound}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Submitted {formatRelative(proposal.submittedAt)}
                </p>
              </div>
              <StatusBadge
                label={titleCase(proposal.status)}
                variant={proposalStatusVariant(proposal.status)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
