import { FileEditIcon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/shared/components/empty-state";
import { StatusBadge } from "@/shared/components/status-badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { formatRelative } from "@/shared/lib/format";
import { titleCase } from "@/shared/lib/string";
import type { Proposal } from "@/shared/lib/types";

import { proposalStatusVariant } from "../utils/variant-mapper";

export function ProposalList({
  loading,
  onSelect,
  proposals,
  selectedId,
}: {
  loading: boolean;
  onSelect: (id: string) => void;
  proposals: Proposal[];
  selectedId: string | null;
}) {
  if (loading) {
    return (
      <div className="space-y-2 rounded-lg border bg-card p-4">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton className="h-20" key={key} />
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return <EmptyState icon={FileEditIcon} title="No proposals match" />;
  }

  return (
    <div className="space-y-2">
      {proposals.map((proposal) => {
        const selected = proposal.id === selectedId;
        return (
          <Button
            className={cn(
              "h-auto w-full justify-start rounded-md border p-3 text-left hover:bg-muted/50",
              selected && "border-primary bg-primary/10"
            )}
            key={proposal.id}
            onClick={() => {
              onSelect(proposal.id);
            }}
            type="button"
            variant="ghost"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{proposal.title}</div>
              <p className="mt-1 text-muted-foreground text-xs">
                <span className="font-mono">{proposal.id}</span> · event{" "}
                {proposal.eventId}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                {titleCase(proposal.scope)} · round {proposal.submissionRound} ·{" "}
                {formatRelative(proposal.submittedAt)}
              </p>
            </div>
            <StatusBadge
              label={titleCase(proposal.status)}
              variant={proposalStatusVariant(proposal.status)}
            />
          </Button>
        );
      })}
    </div>
  );
}
