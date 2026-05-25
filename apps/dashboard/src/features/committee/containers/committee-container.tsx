import { PlusSignIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/shared/lib/auth";

import { CreateDivisionDialog } from "../components/create-division-dialog";
import { DivisionPanel } from "../components/division-panel";
import { DivisionsList } from "../components/divisions-list";
import { EventSelector } from "../components/event-selector";
import { useDivisionApplications } from "../hooks/use-division-applications";
import { useDivisions } from "../hooks/use-divisions";
import { useDivisionsApplicationSummary } from "../hooks/use-divisions-application-summary";
import { useNonClosedEvents } from "../hooks/use-non-closed-events";
import { useSelectedDivisionStore } from "../stores/use-selected-division-store";
import { useSelectedEventStore } from "../stores/use-selected-event-store";

const skeletonRows = ["division-1", "division-2", "division-3"];

export function CommitteeContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const [createOpen, setCreateOpen] = useState(false);

  const eventId = useSelectedEventStore((state) => state.id);
  const setEventId = useSelectedEventStore((state) => state.setId);
  const divisionId = useSelectedDivisionStore((state) => state.id);
  const setDivisionId = useSelectedDivisionStore((state) => state.setId);

  const eventsQuery = useNonClosedEvents();
  const selectedEvent = useMemo(
    () => eventsQuery.data?.find((event) => event.id === eventId) ?? null,
    [eventsQuery.data, eventId]
  );
  const divisionsQuery = useDivisions(eventId);
  const divisions = divisionsQuery.data ?? [];
  const applicationSummary = useDivisionsApplicationSummary(divisions);
  const selectedDivision =
    divisions.find((division) => division.id === divisionId) ?? null;
  const applicationsQuery = useDivisionApplications(selectedDivision?.id);
  const applications = applicationsQuery.data ?? [];
  const isLead = Boolean(user && selectedEvent?.createdById === user.id);

  useEffect(() => {
    const events = eventsQuery.data ?? [];
    if (events.length === 0) {
      if (eventId) {
        setEventId(null);
      }
      return;
    }
    if (!(eventId && events.some((event) => event.id === eventId))) {
      setEventId(events[0].id);
    }
  }, [eventId, eventsQuery.data, setEventId]);

  useEffect(() => {
    if (!eventId || divisions.length === 0) {
      if (divisionId) {
        setDivisionId(null);
      }
      return;
    }
    if (
      !(divisionId && divisions.some((division) => division.id === divisionId))
    ) {
      setDivisionId(divisions[0].id);
    }
  }, [divisionId, divisions, eventId, setDivisionId]);

  if (!user) {
    return null;
  }

  const showLoading = eventsQuery.isPending || divisionsQuery.isPending;
  let detailPanel: ReactNode;

  if (!selectedDivision) {
    detailPanel = (
      <EmptyState icon={UserGroupIcon} title="No division selected" />
    );
  } else if (applicationsQuery.isError) {
    detailPanel = (
      <Alert variant="destructive">
        <AlertTitle>Unable to load applications</AlertTitle>
        <AlertDescription>{applicationsQuery.error.message}</AlertDescription>
      </Alert>
    );
  } else {
    detailPanel = (
      <DivisionPanel
        applications={applications}
        currentUser={user}
        division={selectedDivision}
        isLead={isLead}
      />
    );
  }

  let content: ReactNode;

  if (!eventId) {
    content = (
      <EmptyState
        description="Create or open an event before managing committee divisions."
        icon={UserGroupIcon}
        title="Select an event to manage committee"
      />
    );
  } else if (showLoading) {
    content = (
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-2 rounded-lg border bg-card p-4">
          {skeletonRows.map((row) => (
            <Skeleton className="h-20 w-full" key={row} />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  } else if (divisionsQuery.isError) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Unable to load divisions</AlertTitle>
        <AlertDescription>{divisionsQuery.error.message}</AlertDescription>
      </Alert>
    );
  } else {
    content = (
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <DivisionsList
          divisions={divisions}
          getSummary={applicationSummary.getSummary}
          isLead={isLead}
          onCreate={() => {
            setCreateOpen(true);
          }}
          onSelect={setDivisionId}
          selectedId={divisionId}
        />
        {detailPanel}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          isLead ? (
            <Button
              onClick={() => {
                setCreateOpen(true);
              }}
              type="button"
            >
              <HugeiconsIcon icon={PlusSignIcon} />
              Create division
            </Button>
          ) : null
        }
        subtitle="Manage divisions and review committee applications"
        title="Committee"
      />

      {eventsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load events</AlertTitle>
          <AlertDescription>{eventsQuery.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <EventSelector
        applicationCount={applicationSummary.totalApplications}
        divisionCount={divisions.length}
      />

      {content}

      <CreateDivisionDialog
        eventId={eventId}
        onCreated={(division) => {
          setDivisionId(division.id);
        }}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </div>
  );
}
