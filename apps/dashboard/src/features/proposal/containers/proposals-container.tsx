import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSession } from "@/shared/lib/auth";
import type { Proposal, ProposalStatus } from "@/shared/lib/types";

import { CreateProposalDialog } from "../components/create-proposal-dialog";
import { ProposalDetail } from "../components/proposal-detail";
import { ProposalList } from "../components/proposal-list";
import { ProposalsFilterBar } from "../components/proposals-filter-bar";
import { useProposalsList } from "../hooks/use-proposals-list";
import { useSelectedProposalStore } from "../stores/use-selected-proposal-store";

export function ProposalsContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const [createOpen, setCreateOpen] = useState(false);
  const selectedId = useSelectedProposalStore((state) => state.id);
  const setSelectedId = useSelectedProposalStore((state) => state.setId);
  const proposalsQuery = useProposalsList();
  const proposals = proposalsQuery.data ?? [];

  useEffect(() => {
    if (!selectedId && proposals.length > 0) {
      setSelectedId(proposals[0].id);
    }
    if (
      selectedId &&
      proposals.length > 0 &&
      !proposals.some((proposal) => proposal.id === selectedId)
    ) {
      setSelectedId(proposals[0].id);
    }
  }, [proposals, selectedId, setSelectedId]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button
            onClick={() => {
              setCreateOpen(true);
            }}
            type="button"
          >
            <HugeiconsIcon icon={PlusSignIcon} />
            Submit proposal
          </Button>
        }
        subtitle={`${countByStatus(proposals, "pending")} pending · ${countByStatus(
          proposals,
          "revision_requested"
        )} need revision · ${countByStatus(proposals, "approved")} approved`}
        title="Proposals"
      />

      <ProposalsFilterBar />

      {proposalsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load proposals</AlertTitle>
          <AlertDescription>{proposalsQuery.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <ProposalList
          loading={proposalsQuery.isPending}
          onSelect={setSelectedId}
          proposals={proposals}
          selectedId={selectedId}
        />
        {selectedId ? (
          <ProposalDetail
            proposalId={selectedId}
            userId={user.id}
            userRole={user.role}
          />
        ) : (
          <EmptyState
            icon={PlusSignIcon}
            title="Select a proposal to review details"
          />
        )}
      </div>

      <CreateProposalDialog onOpenChange={setCreateOpen} open={createOpen} />
    </div>
  );
}

function countByStatus(proposals: Proposal[], status: ProposalStatus): number {
  return proposals.filter((proposal) => proposal.status === status).length;
}
