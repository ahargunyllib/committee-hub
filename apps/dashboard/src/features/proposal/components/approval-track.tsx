import { StatusBadge } from "@/components/shared/status-badge";
import type { StatusVariant } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { titleCase } from "@/shared/lib/string";
import type { ProposalApproval, ProposalScope } from "@/shared/lib/types";

import {
  deriveLevelStates,
  type LevelState,
} from "../utils/approval-track-helpers";
import { decisionVariant } from "../utils/variant-mapper";

export function ApprovalTrack({
  approvals,
  currentRound,
  scope,
}: {
  approvals: ProposalApproval[];
  currentRound: number;
  scope: ProposalScope;
}) {
  const states = deriveLevelStates(scope, approvals, currentRound);

  return (
    <div className="space-y-3">
      {states.map((state, index) => (
        <div className="flex gap-3" key={state.level}>
          <Circle number={index + 1} state={state.state} />
          <Card className="flex-1 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{titleCase(state.level)}</div>
                {levelDescription(state)}
              </div>
              <StatusBadge
                label={badgeLabel(state)}
                variant={badgeVariant(state)}
              />
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

type DerivedLevel = ReturnType<typeof deriveLevelStates>[number];

function levelDescription(state: DerivedLevel) {
  if (state.state === "done" && state.approval) {
    return (
      <p className="mt-1 text-muted-foreground text-xs">
        decision: {titleCase(state.approval.decision)}
        {state.approval.notes ? ` - ${state.approval.notes}` : ""}
      </p>
    );
  }
  if (state.state === "active") {
    return (
      <p className="mt-1 text-muted-foreground text-xs">Awaiting review</p>
    );
  }
  return <p className="mt-1 text-muted-foreground text-xs">Queued</p>;
}

function badgeLabel(state: DerivedLevel): string {
  if (state.state === "done" && state.approval) {
    return titleCase(state.approval.decision);
  }
  return state.state;
}

function badgeVariant(state: DerivedLevel): StatusVariant {
  if (state.state === "done" && state.approval) {
    return decisionVariant(state.approval.decision);
  }
  if (state.state === "active") {
    return "pending";
  }
  return "draft";
}

function Circle({ number, state }: { number: number; state: LevelState }) {
  return (
    <div
      className={cn(
        "grid size-8 flex-shrink-0 place-items-center rounded-full border font-semibold text-xs",
        state === "done" &&
          "border-status-success-border bg-status-success-bg text-status-success-fg",
        state === "active" &&
          "border-status-pending-border bg-status-pending-bg text-status-pending-fg",
        state === "queued" &&
          "border-status-draft-border bg-status-draft-bg text-status-draft-fg"
      )}
    >
      {number}
    </div>
  );
}
