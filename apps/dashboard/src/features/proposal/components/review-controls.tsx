import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import type { ProposalDecision, ProposalScope } from "@/shared/lib/types";

import { useReviewProposal } from "../hooks/use-review-proposal";

export function ReviewControls({
  activeLevel,
  proposalId,
  userId,
}: {
  activeLevel: ProposalScope;
  proposalId: string;
  userId: string;
}) {
  const [notes, setNotes] = useState("");
  const mutation = useReviewProposal(proposalId);

  const decide = (decision: ProposalDecision) => {
    mutation.mutate({
      decision,
      level: activeLevel,
      notes,
      reviewerId: userId,
    });
  };

  return (
    <div className="rounded-md border bg-muted/40 p-4">
      <Label htmlFor="review-notes">Review notes</Label>
      <Textarea
        className="mt-1"
        id="review-notes"
        onChange={(event) => {
          setNotes(event.target.value);
        }}
        value={notes}
      />
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button
          disabled={mutation.isPending}
          onClick={() => {
            decide("rejected");
          }}
          type="button"
          variant="destructive"
        >
          Reject
        </Button>
        <Button
          disabled={mutation.isPending}
          onClick={() => {
            decide("revision_requested");
          }}
          type="button"
          variant="ghost"
        >
          Request revision
        </Button>
        <Button
          disabled={mutation.isPending}
          onClick={() => {
            decide("approved");
          }}
          type="button"
        >
          Approve
        </Button>
      </div>
    </div>
  );
}
