# 06 — Committee Screen (Phase 8)

## Goal

Event selector → list divisions → application management. Mahasiswa bisa apply, lead bisa accept/reject.

## Prerequisites

Phase 0-7 done.

## Design Ref

> Page-head + "+ Create division" (only when current user is event lead).
>
> Event selector row: Select labelled "Event" (340px, lists non-closed events). Right rail: badges showing division count + application count + event status.
>
> Two-column grid (1fr / 1.2fr, collapses ≤1100):
> - Left: divisions list — each row: name, description, meta (N/quota filled, created relative, mono id). FillMeter per row.
> - Right: selected division panel — title + description, right rail badges (N/quota, pending count).
>   - Above apps list (mahasiswa view): Apply-CTA banner.
>   - Apps list: avatar + name + id + dept + motivation in quotes + applied time. Status badge + Accept/Reject (lead view).

## API Endpoints

- `GET /events?status=open,draft` (non-closed)
- `GET /committee/events/:eventId/divisions`
- `POST /committee/events/:eventId/divisions`
- `PATCH /committee/divisions/:divisionId`
- `GET /committee/divisions/:divisionId/applications`
- `POST /committee/divisions/:divisionId/applications`
- `PATCH /committee/applications/:applicationId/review`

## Folder Structure

```
src/features/committee/
├── stores/
│   ├── use-selected-event-store.ts
│   └── use-selected-division-store.ts
├── hooks/
│   ├── use-non-closed-events.ts
│   ├── use-divisions.ts
│   ├── use-division-applications.ts
│   ├── use-create-division-form.ts
│   ├── use-apply-division-form.ts
│   └── use-review-application.ts
├── containers/
│   └── committee-container.tsx
├── components/
│   ├── event-selector.tsx
│   ├── divisions-list.tsx
│   ├── division-panel.tsx
│   ├── application-row.tsx
│   ├── fill-meter.tsx
│   ├── apply-cta-banner.tsx
│   ├── create-division-dialog.tsx
│   └── apply-dialog.tsx
└── utils/
    └── variant-mapper.ts            # applicationStatusVariant
```

## File Outlines

### `containers/committee-container.tsx`

```tsx
export function CommitteeContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const eventId = useSelectedEventStore((s) => s.id);
  const divisionId = useSelectedDivisionStore((s) => s.id);
  const setDivisionId = useSelectedDivisionStore((s) => s.setId);
  const { data: divisions } = useDivisions(eventId);
  const { data: applications } = useDivisionApplications(divisionId);
  const isLead = user && event?.createdById === user.id;

  // Auto-select first division when event changes
  useEffect(() => {
    if (divisions?.length && !divisions.find((d) => d.id === divisionId)) {
      setDivisionId(divisions[0].id);
    }
  }, [divisions, divisionId, setDivisionId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Committee"
        actions={isLead ? <Button onClick={() => setCreateOpen(true)}>+ Create division</Button> : null}
      />
      <EventSelector />
      {!eventId ? (
        <EmptyState icon={UserGroupIcon} title="Select an event to manage committee" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <DivisionsList divisions={divisions ?? []} selectedId={divisionId} onSelect={setDivisionId} />
          {divisionId ? (
            <DivisionPanel
              division={divisions?.find((d) => d.id === divisionId)!}
              applications={applications ?? []}
              isLead={!!isLead}
              currentUser={user!}
            />
          ) : (
            <EmptyState icon={UserGroupIcon} title="No division selected" />
          )}
        </div>
      )}
      <CreateDivisionDialog open={createOpen} onOpenChange={setCreateOpen} eventId={eventId} />
    </div>
  );
}
```

### `components/event-selector.tsx`

```tsx
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNonClosedEvents } from "../hooks/use-non-closed-events";
import { useSelectedEventStore } from "../stores/use-selected-event-store";

export function EventSelector() {
  const { data: events } = useNonClosedEvents();
  const { id, setId } = useSelectedEventStore();
  const selected = events?.find((e) => e.id === id);

  return (
    <div className="flex items-center gap-4">
      <div className="w-[340px]">
        <Label>Event</Label>
        <Select value={id ?? ""} onValueChange={setId}>
          <SelectTrigger><SelectValue placeholder="Choose event" /></SelectTrigger>
          <SelectContent>
            {events?.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {selected ? (
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary">{selected.status}</Badge>
          {/* division & app counts can be wired here */}
        </div>
      ) : null}
    </div>
  );
}
```

### `components/divisions-list.tsx`

Card list. Each row selectable button with name + truncated description + meta line + FillMeter on right rail.

### `components/fill-meter.tsx`

```tsx
export function FillMeter({ filled, quota }: { filled: number; quota: number }) {
  const pct = Math.min(100, (filled / Math.max(1, quota)) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs">{filled}/{quota}</span>
      <div className="h-1 w-16 overflow-hidden rounded bg-muted">
        <div className="h-full rounded bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

### `components/division-panel.tsx`

```tsx
export function DivisionPanel({ division, applications, isLead, currentUser }) {
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const accepted = applications.filter((a) => a.status === "accepted").length;
  const myApplication = applications.find((a) => a.userId === currentUser.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{division.name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{division.description}</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <FillMeter filled={accepted} quota={division.quota} />
          {pendingCount > 0 ? <Badge variant="secondary">{pendingCount} pending</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        {currentUser.role === "mahasiswa" && !myApplication ? (
          <ApplyCtaBanner divisionId={division.id} divisionName={division.name} userId={currentUser.id} />
        ) : myApplication ? (
          <div className="mb-4 rounded-md border bg-muted/40 p-4">
            Your application: <StatusBadge variant={applicationStatusVariant(myApplication.status)} label={myApplication.status} />
          </div>
        ) : null}

        {applications.length === 0 ? (
          <EmptyState icon={UserGroupIcon} title="No applications yet" />
        ) : (
          <ul className="divide-y rounded-md border">
            {applications.map((app) => (
              <ApplicationRow key={app.id} application={app} isLead={isLead} currentUserId={currentUser.id} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
```

### `components/application-row.tsx`

```tsx
export function ApplicationRow({ application, isLead, currentUserId }) {
  const review = useReviewApplication();
  return (
    <li className="flex items-start gap-3 p-4">
      <Avatar className="size-9">
        <AvatarFallback>{getInitials(application.userId)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{/* user name from cache or lookup */}</span>
          <code className="font-mono text-xs text-muted-foreground">{application.userId}</code>
        </div>
        {application.motivation ? (
          <p className="mt-1 italic text-sm text-muted-foreground">"{application.motivation}"</p>
        ) : null}
        <p className="mt-1 text-xs text-muted-foreground">Applied {formatRelative(application.createdAt)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge variant={applicationStatusVariant(application.status)} label={application.status} />
        {isLead && application.status === "pending" ? (
          <div className="flex gap-1">
            <Button size="sm" onClick={() => review.mutate({ applicationId: application.id, reviewerId: currentUserId, status: "accepted" })}>
              Accept
            </Button>
            <Button size="sm" variant="destructive" onClick={() => review.mutate({ applicationId: application.id, reviewerId: currentUserId, status: "rejected" })}>
              Reject
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
```

### `components/apply-cta-banner.tsx`

```tsx
export function ApplyCtaBanner({ divisionId, divisionName, userId }: ...) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 rounded-md border bg-muted/40 p-4">
      <h4 className="font-medium">Apply to {divisionName}</h4>
      <p className="mt-1 text-sm text-muted-foreground">Submit your motivation to be considered.</p>
      <Button className="mt-3" onClick={() => setOpen(true)}>Apply</Button>
      <ApplyDialog open={open} onOpenChange={setOpen} divisionId={divisionId} userId={userId} />
    </div>
  );
}
```

### `components/apply-dialog.tsx`

Form: motivation Textarea (Zod min 8 chars). POST `/committee/divisions/:id/applications`.

### `hooks/use-review-application.ts`

```ts
export function useReviewApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, ...body }: { applicationId: string; reviewerId: string; status: "accepted"|"rejected" }) =>
      api.patch(`/committee/applications/${applicationId}/review`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application reviewed");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
```

## Route

```tsx
// src/routes/dashboard/committee.tsx
import { createFileRoute } from "@tanstack/react-router";
import { CommitteeContainer } from "@/features/committee/containers/committee-container";

export const Route = createFileRoute("/dashboard/committee")({
  component: CommitteeContainer,
});
```

## Edge Cases

- No events available → "Create an event first" empty state.
- No divisions in event → "No divisions yet" with "Create division" CTA (lead only).
- User already applied → show their status instead of CTA.
- Filled to quota → maybe hide Apply or show "Full" disabled state.

## Acceptance Criteria

- Pilih event → divisi muncul.
- Create division (sebagai lead) → tambah ke list.
- Apply (sebagai mahasiswa) → muncul di applications + status pending.
- Accept/Reject (sebagai lead) → status berubah, fill meter updates.

## Commit

```
feat(dashboard): add committee screen with divisions + applications
```
