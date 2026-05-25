import {
  Calendar03Icon,
  PlusSignIcon,
  Ticket01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { useState } from "react";

import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { canAccess, RESOURCES } from "@/shared/lib/permissions";
import { useSession } from "@/shared/lib/auth";

import { CreateEventDialog } from "../components/create-event-dialog";
import { EventCard } from "../components/event-card";
import { EventsFilterBar } from "../components/events-filter-bar";
import { VerifyTicketDialog } from "../components/verify-ticket-dialog";
import { useEventsList } from "../hooks/use-events-list";
import { useEventsFilterStore } from "../stores/use-events-filter-store";

const skeletonCards = [
  "event-1",
  "event-2",
  "event-3",
  "event-4",
  "event-5",
  "event-6",
];

export function EventsGridContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const [createOpen, setCreateOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const reset = useEventsFilterStore((state) => state.reset);
  const eventsQuery = useEventsList();

  if (!user) {
    return null;
  }

  const canCreate = canAccess(user.role, RESOURCES.CREATE_EVENT);
  const canVerify = canAccess(user.role, RESOURCES.VERIFY_TICKET);
  const events = eventsQuery.data ?? [];
  let content: ReactNode;

  if (eventsQuery.isPending) {
    content = <EventsSkeleton />;
  } else if (events.length === 0) {
    content = (
      <EmptyState
        action={{ label: "Reset filters", onClick: reset }}
        icon={Calendar03Icon}
        title="No events match"
      />
    );
  } else {
    content = (
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
        {events.map((event) => (
          <EventCard
            event={event}
            key={event.id}
            userId={user.id}
            userRole={user.role}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            {canVerify ? (
              <Button
                onClick={() => {
                  setVerifyOpen(true);
                }}
                type="button"
                variant="ghost"
              >
                <HugeiconsIcon icon={Ticket01Icon} />
                Verify ticket
              </Button>
            ) : null}
            {canCreate ? (
              <Button
                onClick={() => {
                  setCreateOpen(true);
                }}
                type="button"
              >
                <HugeiconsIcon icon={PlusSignIcon} />
                Create event
              </Button>
            ) : null}
          </>
        }
        subtitle="Search, filter, create, manage, register, and verify tickets"
        title="Events"
      />

      <EventsFilterBar />

      {eventsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load events</AlertTitle>
          <AlertDescription>{eventsQuery.error.message}</AlertDescription>
        </Alert>
      ) : null}

      {content}

      <CreateEventDialog onOpenChange={setCreateOpen} open={createOpen} />
      <VerifyTicketDialog onOpenChange={setVerifyOpen} open={verifyOpen} />
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
      {skeletonCards.map((card) => (
        <Skeleton className="h-56" key={card} />
      ))}
    </div>
  );
}
