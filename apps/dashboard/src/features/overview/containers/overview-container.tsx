import { PlusSignIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { CreateEventDialog } from "@/features/event/components/create-event-dialog";
import { canAccess, RESOURCES } from "@/shared/lib/permissions";
import { useSession } from "@/shared/lib/auth";

import { ProposalWorkQueue } from "../components/proposal-work-queue";
import { StatTiles } from "../components/stat-tiles";
import { UpcomingEventsList } from "../components/upcoming-events-list";
import { WorkflowStrip } from "../components/workflow-strip";
import { useOverviewData } from "../hooks/use-overview-data";

export function OverviewContainer() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user;
  const [createOpen, setCreateOpen] = useState(false);
  const data = useOverviewData(user?.id);

  if (!user) {
    return null;
  }

  const firstName = user.name.split(" ")[0] ?? user.name;
  const subtitle = `${formatTodayLong()} · ${data.openEventsCount} open events · ${data.pendingProposalsCount} proposals in flight`;

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button
              onClick={() => {
                queryClient.invalidateQueries();
              }}
              type="button"
              variant="ghost"
            >
              <HugeiconsIcon icon={RefreshIcon} />
              Refresh
            </Button>
            {canAccess(user.role, RESOURCES.CREATE_EVENT) ? (
              <Button
                onClick={() => {
                  setCreateOpen(true);
                }}
                type="button"
              >
                <HugeiconsIcon icon={PlusSignIcon} />
                New event
              </Button>
            ) : null}
          </>
        }
        subtitle={subtitle}
        title={`Good ${greetingPart()}, ${firstName}`}
      />

      {data.isLoading ? (
        <OverviewSkeleton />
      ) : (
        <>
          <StatTiles data={data} />
          <WorkflowStrip data={data} />
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <UpcomingEventsList events={data.upcomingEvents} />
            <ProposalWorkQueue items={data.proposalQueue} />
          </div>
        </>
      )}

      <CreateEventDialog onOpenChange={setCreateOpen} open={createOpen} />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton className="h-32" key={key} />
        ))}
      </div>
      <Skeleton className="h-40" />
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

function greetingPart(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "morning";
  }
  if (hour < 18) {
    return "afternoon";
  }
  return "evening";
}

function formatTodayLong(): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    weekday: "long",
  }).format(new Date());
}
