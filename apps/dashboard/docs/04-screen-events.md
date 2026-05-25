# 04 — Events Screen (Phase 6)

## Goal

List events dengan search + filter (status, type), grid card. Create event dialog (untuk ketua_panitia/admin). Verify ticket dialog. Register/Open/Close actions per card.

## Prerequisites

Phase 0-5 done.

## Design Ref

> Page-head + actions row (subtle "Verify ticket", primary "+ Create event" if `ketua_panitia` or `admin`).
>
> Filter row: Search input (icon: magnifier, 320px), Status segmented (All / Open / Draft / Closed with count), Type segmented (All / Internal / External).
>
> Event grid: `auto-fill, minmax(320px, 1fr)`, 24px gap. Card: title + 2-line desc, status/type badges right rail, meta grid 2-col (date, time-relative, location, quota), footer with mono id + actions.
>
> Empty state: events icon + "No events match" + reset filters button.

## API Endpoints

- `GET /events?type=&status=&search=`
- `POST /events`
- `PATCH /events/:eventId` (status toggle)
- `POST /events/:eventId/registrations` (register me)
- `POST /events/tickets/:ticketCode/verify`

## Folder Structure

```
src/features/event/
├── types/
│   └── event.ts                     # Re-export from shared types
├── stores/
│   └── use-events-filter-store.ts
├── hooks/
│   ├── use-events-list.ts
│   ├── use-create-event-form.ts
│   ├── use-update-event-status.ts
│   ├── use-register-event.ts
│   └── use-verify-ticket-form.ts
├── containers/
│   └── events-grid-container.tsx
├── components/
│   ├── events-filter-bar.tsx
│   ├── event-card.tsx
│   ├── create-event-dialog.tsx
│   └── verify-ticket-dialog.tsx
└── utils/
    └── variant-mapper.ts            # eventStatusVariant (sudah di design-tokens.md)
```

## File Outlines

### `stores/use-events-filter-store.ts`

Pakai pattern di [conventions.md](./conventions.md#zustand-store-pattern). State: `{ search, status: "all"|"open"|"draft"|"closed", type: "all"|"internal"|"external" }`.

### `hooks/use-events-list.ts`

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/lib/api";
import { useEventsFilterStore } from "../stores/use-events-filter-store";
import type { Event } from "@/shared/lib/types";

export function useEventsList() {
  const { filter } = useEventsFilterStore();
  const params = {
    status: filter.status === "all" ? undefined : filter.status,
    type: filter.type === "all" ? undefined : filter.type,
    search: filter.search || undefined,
  };
  return useQuery({
    queryKey: ["events", "list", params],
    queryFn: () => api.get<Event[]>("/events", params),
  });
}
```

### `hooks/use-create-event-form.ts`

```ts
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { api, ApiError } from "@/shared/lib/api";
import { useSession } from "@/shared/lib/auth";
import type { Event } from "@/shared/lib/types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  date: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  quota: z.number().int().min(1),
  type: z.enum(["internal", "external"]),
  description: z.string().optional(),
});
type Input = z.infer<typeof schema>;

export function useCreateEventForm(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const mutation = useMutation({
    mutationFn: (value: Input) =>
      api.post<Event>("/events", {
        ...value,
        createdById: session?.user.id,
        date: new Date(value.date).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created as draft");
      onSuccess?.();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  })();

  const form = useForm({
    defaultValues: {
      name: "",
      date: defaultDate,
      location: "",
      quota: 1,
      type: "internal",
      description: "",
    } satisfies Input,
    validators: { onChange: schema },
    onSubmit: async ({ value }) => mutation.mutateAsync(value),
  });

  return { form, mutation };
}
```

### `containers/events-grid-container.tsx`

```tsx
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { canAccess, RESOURCES } from "@/shared/lib/permissions";
import { useSession } from "@/shared/lib/auth";
import { EventsFilterBar } from "../components/events-filter-bar";
import { EventCard } from "../components/event-card";
import { CreateEventDialog } from "../components/create-event-dialog";
import { VerifyTicketDialog } from "../components/verify-ticket-dialog";
import { useEventsList } from "../hooks/use-events-list";
import { useEventsFilterStore } from "../stores/use-events-filter-store";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";

export function EventsGridContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const [createOpen, setCreateOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const { data: events, isPending } = useEventsList();
  const reset = useEventsFilterStore((s) => s.reset);

  if (!user) return null;
  const canCreate = canAccess(user.role, RESOURCES.CREATE_EVENT);
  const canVerify = canAccess(user.role, RESOURCES.VERIFY_TICKET);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        subtitle="Search, filter, create, manage, register, verify ticket"
        actions={
          <>
            {canVerify ? (
              <Button variant="ghost" onClick={() => setVerifyOpen(true)}>Verify ticket</Button>
            ) : null}
            {canCreate ? (
              <Button onClick={() => setCreateOpen(true)}>+ Create event</Button>
            ) : null}
          </>
        }
      />

      <EventsFilterBar />

      {isPending ? (
        <Skeleton />
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={Calendar03Icon}
          title="No events match"
          action={{ label: "Reset filters", onClick: reset }}
        />
      ) : (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {events.map((evt) => <EventCard key={evt.id} event={evt} userRole={user.role} userId={user.id} />)}
        </div>
      )}

      <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} />
      <VerifyTicketDialog open={verifyOpen} onOpenChange={setVerifyOpen} />
    </div>
  );
}

function Skeleton() {
  return <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">{Array.from({length:6}).map((_,i)=><div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />)}</div>;
}
```

Route:

```tsx
// src/routes/dashboard/events.tsx
import { createFileRoute } from "@tanstack/react-router";
import { EventsGridContainer } from "@/features/event/containers/events-grid-container";

export const Route = createFileRoute("/dashboard/events")({
  component: EventsGridContainer,
});
```

### `components/events-filter-bar.tsx`

Search Input (320px, dengan icon left), Status ToggleGroup, Type ToggleGroup.

```tsx
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEventsFilterStore } from "../stores/use-events-filter-store";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

export function EventsFilterBar() {
  const { filter, setSearch, setStatus, setType } = useEventsFilterStore();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative w-80">
        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, location, or id…"
          value={filter.search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <ToggleGroup type="single" value={filter.status} onValueChange={(v) => v && setStatus(v as any)}>
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="open">Open</ToggleGroupItem>
        <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
        <ToggleGroupItem value="closed">Closed</ToggleGroupItem>
      </ToggleGroup>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Type</span>
        <ToggleGroup type="single" value={filter.type} onValueChange={(v) => v && setType(v as any)}>
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="internal">Internal</ToggleGroupItem>
          <ToggleGroupItem value="external">External</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
```

### `components/event-card.tsx`

```tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatRelative } from "@/shared/lib/format";
import { eventStatusVariant } from "../utils/variant-mapper";
import type { Event } from "@/shared/lib/types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, Clock01Icon, Location01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { canAccess, RESOURCES } from "@/shared/lib/permissions";
import { useUpdateEventStatus } from "../hooks/use-update-event-status";
import { useRegisterEvent } from "../hooks/use-register-event";

type Props = { event: Event; userRole: string; userId: string };

export function EventCard({ event, userRole, userId }: Props) {
  const updateStatus = useUpdateEventStatus();
  const register = useRegisterEvent();
  const canManage = canAccess(userRole, RESOURCES.CREATE_EVENT);

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{event.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge variant={eventStatusVariant(event.status)} label={event.status} dot />
          <StatusBadge variant={event.type === "internal" ? "draft" : "info"} label={event.type} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t bg-muted/40 px-5 py-3 text-xs">
        <MetaItem icon={Calendar03Icon} text={formatDate(event.date)} bold />
        <MetaItem icon={Clock01Icon} text={formatRelative(event.date)} />
        <MetaItem icon={Location01Icon} text={event.location} />
        <MetaItem icon={UserGroupIcon} text={`quota ${event.quota}`} />
      </div>

      <div className="flex items-center justify-between border-t bg-muted/50 px-5 py-3 text-xs">
        <code className="font-mono text-muted-foreground">{event.id}</code>
        <div className="flex items-center gap-2">
          {event.status === "open" && !canManage ? (
            <Button size="sm" variant="default" onClick={() => register.mutate({ eventId: event.id, userId })}>
              Register
            </Button>
          ) : null}
          {canManage ? (
            <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: event.id, status: nextStatus(event.status) })}>
              {nextStatusLabel(event.status)}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function MetaItem({ icon, text, bold }: { icon: any; text: string; bold?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <HugeiconsIcon icon={icon} className="size-3.5 text-muted-foreground" />
      <span className={bold ? "font-medium" : ""}>{text}</span>
    </div>
  );
}

function nextStatus(s: Event["status"]): Event["status"] {
  if (s === "draft") return "open";
  if (s === "open") return "closed";
  return "open"; // closed → reopen
}
function nextStatusLabel(s: Event["status"]): string {
  if (s === "draft") return "Open";
  if (s === "open") return "Close";
  return "Reopen";
}
```

### `components/create-event-dialog.tsx`

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreateEventForm } from "../hooks/use-create-event-form";

export function CreateEventDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { form, mutation } = useCreateEventForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription>Event will be created as draft.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Name</Label>
                <Input id={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          {/* date, location, quota, type Select, description Textarea -- repeat pattern */}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>Create as draft</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ errors }: { errors: any[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive">{String(errors[0]?.message ?? errors[0])}</p>;
}
```

### `components/verify-ticket-dialog.tsx`

Single input + verify button → call `useVerifyTicketForm` (mutation POST `/events/tickets/:code/verify`). Show toast success/error.

## Edge Cases

- Empty search/filter → reset button.
- Network error → toast.
- Already registered → API conflict (409) → "You are already registered".

## Acceptance Criteria

- Filter bar persistent dengan Zustand.
- Grid responsive 1-3 cols.
- Create event dialog works (form validation, default date +14 days, helper text "Internal events skip Fakultas/Universitas approval.").
- Verify ticket dialog: hint "Codes look like CMTHB-XXXX-XXXX." dengan toast.
- Status toggle (draft→open→closed→open) refetch list.
- Mahasiswa hanya lihat Register button untuk event open. Tidak lihat Create/Verify.

## Commit

```
feat(dashboard): add events screen with create + verify ticket
```
