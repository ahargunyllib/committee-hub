# 03 — Overview Screen (Phase 5)

## Goal

Dashboard utama: greeting + 4 stat tiles + workflow strip + 2-col bottom row (upcoming events + proposal work queue).

## Prerequisites

Phase 0-4 done.

## Design Ref (excerpt dari `design_handoff_committee_hub/README.md`)

> Page-head greets user by first name with a one-line subtitle ("Monday, May 25 · 4 open events · 3 proposals in flight"). Page actions: subtle Refresh + primary "+ New event".
>
> Four stat tiles: System health, Open events, Pending proposals, Unread notifications.
>
> Workflow strip — flat 4-column inline section showing where active events sit in the pipeline: Divisions → Proposal → Registration → Notifications.
>
> Bottom row, two columns (1.35fr / 1fr): Upcoming events (5 rows) + Proposal work queue.

## API Endpoints

- `GET /events?status=open` — open events count + upcoming list.
- `GET /events?status=draft` — draft count.
- `GET /proposals?status=pending` — pending proposals count + work queue.
- `GET /proposals?status=revision_requested` — revision count.
- `GET /notifications?userId=<id>&read=false` — unread count.

## Folder Structure

```
src/features/overview/
├── containers/
│   └── overview-container.tsx
├── components/
│   ├── stat-tiles.tsx
│   ├── workflow-strip.tsx
│   ├── upcoming-events-list.tsx
│   └── proposal-work-queue.tsx
└── hooks/
    └── use-overview-data.ts
```

## File Outlines

### `containers/overview-container.tsx`

```tsx
import { useSession } from "@/shared/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatTiles } from "../components/stat-tiles";
import { WorkflowStrip } from "../components/workflow-strip";
import { UpcomingEventsList } from "../components/upcoming-events-list";
import { ProposalWorkQueue } from "../components/proposal-work-queue";
import { useOverviewData } from "../hooks/use-overview-data";
import { useQueryClient } from "@tanstack/react-query";
import { canAccess, RESOURCES } from "@/shared/lib/permissions";
// import { CreateEventDialog } from "@/features/event/components/create-event-dialog";

export function OverviewContainer() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user;
  const data = useOverviewData(user?.id);

  if (!user) return null;
  const firstName = user.name.split(" ")[0];
  const subtitle = `${formatTodayLong()} · ${data.openEventsCount} open events · ${data.pendingProposalsCount} proposals in flight`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${greetingPart()}, ${firstName}`}
        subtitle={subtitle}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => queryClient.invalidateQueries()}
            >
              Refresh
            </Button>
            {canAccess(user.role, RESOURCES.CREATE_EVENT) ? (
              {/* <CreateEventDialog /> akan diisi di Phase 6 */}
              <Button>+ New event</Button>
            ) : null}
          </>
        }
      />

      <StatTiles data={data} />
      <WorkflowStrip data={data} />
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <UpcomingEventsList events={data.upcomingEvents} />
        <ProposalWorkQueue items={data.proposalQueue} />
      </div>
    </div>
  );
}

function greetingPart(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
function formatTodayLong(): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(new Date());
}
```

Pasang di route:

```tsx
// src/routes/dashboard/overview.tsx
import { createFileRoute } from "@tanstack/react-router";
import { OverviewContainer } from "@/features/overview/containers/overview-container";

export const Route = createFileRoute("/dashboard/overview")({
  component: OverviewContainer,
});
```

### `hooks/use-overview-data.ts`

```ts
import { useQueries } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import type { Event, Proposal, Notification } from "@/shared/lib/types";

export function useOverviewData(userId: string | undefined) {
  const [openEvents, draftEvents, pendingProposals, revisionProposals, unread] = useQueries({
    queries: [
      { queryKey: ["events", "list", { status: "open" }], queryFn: () => api.get<Event[]>("/events", { status: "open" }) },
      { queryKey: ["events", "list", { status: "draft" }], queryFn: () => api.get<Event[]>("/events", { status: "draft" }) },
      { queryKey: ["proposals", "list", { status: "pending" }], queryFn: () => api.get<Proposal[]>("/proposals", { status: "pending" }) },
      { queryKey: ["proposals", "list", { status: "revision_requested" }], queryFn: () => api.get<Proposal[]>("/proposals", { status: "revision_requested" }) },
      {
        queryKey: ["notifications", "list", { userId, read: false }],
        queryFn: () => api.get<Notification[]>("/notifications", { userId: userId ?? "", read: "false" }),
        enabled: !!userId,
      },
    ],
  });

  return {
    openEventsCount: openEvents.data?.length ?? 0,
    draftEventsCount: draftEvents.data?.length ?? 0,
    pendingProposalsCount: pendingProposals.data?.length ?? 0,
    revisionCount: revisionProposals.data?.length ?? 0,
    unreadCount: unread.data?.length ?? 0,
    upcomingEvents: (openEvents.data ?? []).slice(0, 5),
    proposalQueue: [
      ...(pendingProposals.data ?? []),
      ...(revisionProposals.data ?? []),
    ].slice(0, 5),
    isLoading:
      openEvents.isPending ||
      draftEvents.isPending ||
      pendingProposals.isPending ||
      revisionProposals.isPending ||
      unread.isPending,
  };
}
```

### `components/stat-tiles.tsx`

```tsx
import { StatTile } from "@/components/shared/stat-tile";

export function StatTiles({ data }: { data: ReturnType<typeof useOverviewData> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        label="System health"
        value={<span className="text-xl">OK</span>}
        trailing={<span className="size-2 rounded-full bg-emerald-500" />}
        foot="api.committee-hub · last check 1m ago"
      />
      <StatTile
        label="Open events"
        value={data.openEventsCount}
        delta={`(${data.draftEventsCount}) draft`}
        foot="Total this semester"
      />
      <StatTile
        label="Pending proposals"
        value={data.pendingProposalsCount}
        delta={data.revisionCount > 0 ? `(${data.revisionCount}) need revision` : null}
      />
      <StatTile
        label="Unread notifications"
        value={data.unreadCount}
        trailing={<span className="size-2 rounded-full bg-primary" />}
      />
    </div>
  );
}
```

### `components/workflow-strip.tsx`

Flat 4-column strip menampilkan jumlah per pipeline step. Implement simple grid 4-col dengan card per step.

```tsx
export function WorkflowStrip({ data }: { data: ... }) {
  const steps = [
    { num: "01", label: "Divisions", value: "N divisions", meta: "across active events" },
    { num: "02", label: "Proposal", value: data.pendingProposalsCount, meta: "in flight" },
    { num: "03", label: "Registration", value: "N events", meta: "open for registration" },
    { num: "04", label: "Notifications", value: data.unreadCount, meta: "unread" },
  ];
  return (
    <div className="grid gap-4 rounded-lg border bg-card p-6 md:grid-cols-4">
      {steps.map((s) => (
        <div key={s.num}>
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</span>
            <span className="font-mono text-xs text-muted-foreground">{s.num}</span>
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</div>
          <p className="text-xs text-muted-foreground">{s.meta}</p>
          <div className="mt-3 h-1 rounded bg-muted">
            <div className="h-full w-2/3 rounded bg-primary" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### `components/upcoming-events-list.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateChip } from "@/shared/lib/format";
import type { Event } from "@/shared/lib/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";

export function UpcomingEventsList({ events }: { events: Event[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming events</CardTitle>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {events.map((evt) => {
          const chip = formatDateChip(evt.date);
          return (
            <div key={evt.id} className="flex items-start gap-3 p-4">
              <div className="grid size-11 flex-shrink-0 place-items-center rounded-md border bg-muted/50">
                <span className="text-[9px] font-medium uppercase text-muted-foreground">{chip.month}</span>
                <span className="text-base font-semibold leading-none">{chip.day}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{evt.name}</div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon icon={Location01Icon} className="size-3" />
                    {evt.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon icon={UserGroupIcon} className="size-3" />
                    quota {evt.quota}
                  </span>
                  <span className="font-mono text-muted-foreground/60">{evt.id}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge variant={evt.type === "internal" ? "draft" : "info"} label={evt.type} />
                <StatusBadge variant="success" label={evt.status} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

### `components/proposal-work-queue.tsx`

Similar: list of proposals + status badge + submitter avatar + relative time.

## Edge Cases

- Loading → Skeleton di stat tiles dan list rows.
- Empty events → EmptyState dengan icon + "No upcoming events".
- Empty proposal queue → "Nothing waiting".
- Network error → toast + retry button.

## Acceptance Criteria

- Halaman render dengan 4 stat tiles + workflow strip + 2 lists.
- Klik Refresh → semua query refetch.
- Klik "+ New event" → buka CreateEventDialog (Phase 6 sudah ada; sebelum itu dummy/disabled).
- Mahasiswa tidak melihat "+ New event" button.
- Tidak crash kalau API return empty list.

## Commit

```
feat(dashboard): add overview screen
```
