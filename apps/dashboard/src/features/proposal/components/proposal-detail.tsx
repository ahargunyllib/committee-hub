import { FileEditIcon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/shared/lib/format";
import { titleCase } from "@/shared/lib/string";

import { useProposalApprovals } from "../hooks/use-proposal-approvals";
import { useProposalDetail } from "../hooks/use-proposal-detail";
import { useResubmitProposal } from "../hooks/use-resubmit-proposal";
import {
  activeReviewLevel,
  canReview,
  deriveLevelStates,
} from "../utils/approval-track-helpers";
import { proposalStatusVariant } from "../utils/variant-mapper";
import { ApprovalTrack } from "./approval-track";
import { ReviewControls } from "./review-controls";

export function ProposalDetail({
  proposalId,
  userId,
  userRole,
}: {
  proposalId: string;
  userId: string;
  userRole: string;
}) {
  const proposalQuery = useProposalDetail(proposalId);
  const approvalsQuery = useProposalApprovals(proposalId);
  const resubmit = useResubmitProposal();

  if (proposalQuery.isPending || approvalsQuery.isPending) {
    return <Skeleton className="h-96" />;
  }

  const proposal = proposalQuery.data;
  if (!proposal) {
    return <EmptyState icon={FileEditIcon} title="Select a proposal" />;
  }

  const approvals = approvalsQuery.data ?? [];
  const states = deriveLevelStates(
    proposal.scope,
    approvals,
    proposal.submissionRound
  );
  const activeLevel = activeReviewLevel(states);
  const reviewerCanAct = canReview(userRole, states) && activeLevel;
  const canResubmit =
    proposal.submittedById === userId &&
    (proposal.status === "rejected" ||
      proposal.status === "revision_requested");

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{proposal.title}</CardTitle>
          <p className="mt-1 text-muted-foreground text-xs">
            <span className="font-mono">{proposal.id}</span> · event{" "}
            {proposal.eventId}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge
            label={titleCase(proposal.status)}
            variant={proposalStatusVariant(proposal.status)}
          />
          {proposal.documentUrl ? (
            <Button asChild size="sm" variant="ghost">
              <a
                href={proposal.documentUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open document
              </a>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 rounded-md border bg-muted/40 p-3 text-sm md:grid-cols-4">
          <Meta label="Submitted by" value={proposal.submittedById} />
          <Meta label="Scope" value={titleCase(proposal.scope)} />
          <Meta label="Round" value={String(proposal.submissionRound)} />
          <Meta
            label="Submitted"
            value={formatDateTime(proposal.submittedAt)}
          />
        </div>

        {proposal.description ? (
          <p className="text-muted-foreground text-sm">
            {proposal.description}
          </p>
        ) : null}

        <ApprovalTrack
          approvals={approvals}
          currentRound={proposal.submissionRound}
          scope={proposal.scope}
        />

        {reviewerCanAct ? (
          <ReviewControls
            activeLevel={activeLevel}
            proposalId={proposal.id}
            userId={userId}
          />
        ) : null}

        {canResubmit ? (
          <div className="flex justify-end">
            <Button
              disabled={resubmit.isPending}
              onClick={() => {
                resubmit.mutate(proposal.id);
              }}
              type="button"
              variant="secondary"
            >
              Resubmit
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 truncate font-medium">{value}</div>
    </div>
  );
}
