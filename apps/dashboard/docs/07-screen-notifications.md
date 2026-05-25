# 07 — Notifications Screen (Phase 9)

## Goal

List user's notifications dengan filter All/Unread/Read. Mark-read per item dan mark-all-read.

## Prerequisites

Phase 0-8 done.

## Design Ref

> Subtitle: "(N) unread of (M) total". Page action: subtle "Mark all read" (disabled when no unread).
>
> Filter row: segmented All / Unread / Read with counts. Right: "Showing (filtered count)".
>
> List card (`tight` body). Each row:
> - 30×30 icon pill — color matched to notification kind.
> - Title row: 7px accent dot if unread, then label (semibold unread / medium read).
> - Message line below, muted small.
> - Right rail: relative time, then "Mark read" (sm subtle) if unread, dim "Read" text if read.
> - Unread row bg: subtle accent tint.
>
> Empty states: "Inbox zero" for Unread / "No notifications" for All.

## API Endpoints

- `GET /notifications?userId=&read=`
- `PATCH /notifications/:id/read` body `{ userId }`
- `PATCH /notifications/read-all` body `{ userId }`

## Folder Structure

```
src/features/notification/
├── stores/
│   └── use-notifications-filter-store.ts     # { tab: "all"|"unread"|"read" }
├── hooks/
│   ├── use-notifications-list.ts              # query for tab
│   ├── use-notifications-count.ts             # unread count (used by sidebar)
│   ├── use-mark-read.ts
│   └── use-mark-all-read.ts
├── containers/
│   └── notifications-container.tsx
├── components/
│   ├── notifications-filter-tabs.tsx
│   ├── notification-row.tsx
│   └── notification-icon.tsx
└── utils/
    └── notification-meta.ts                   # type → label + icon + tone
```

## Helpers

### `utils/notification-meta.ts`

```ts
import {
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Repeat01Icon,
  UserGroupIcon,
  TicketStar01Icon,
} from "@hugeicons/core-free-icons";
import type { NotificationType } from "@/shared/lib/types";

export const NOTIFICATION_META: Record<NotificationType, { icon: any; tone: "success"|"danger"|"info"|"pending" }> = {
  proposal_approved: { icon: CheckmarkCircle02Icon, tone: "success" },
  proposal_rejected: { icon: CancelCircleIcon, tone: "danger" },
  proposal_revision_requested: { icon: Repeat01Icon, tone: "info" },
  application_accepted: { icon: UserGroupIcon, tone: "success" },
  application_rejected: { icon: UserGroupIcon, tone: "danger" },
  registration_success: { icon: TicketStar01Icon, tone: "success" },
};

export function notificationLabel(type: NotificationType): string {
  return type.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}
```

## File Outlines

### `containers/notifications-container.tsx`

```tsx
export function NotificationsContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const tab = useNotificationsFilterStore((s) => s.tab);
  const { data: all } = useNotificationsList(user?.id, undefined);
  const { data: unread } = useNotificationsList(user?.id, false);
  const { data: read } = useNotificationsList(user?.id, true);
  const markAll = useMarkAllRead();

  if (!user) return null;
  const total = all?.length ?? 0;
  const unreadCount = unread?.length ?? 0;
  const items = tab === "all" ? all : tab === "unread" ? unread : read;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread of ${total} total`}
        actions={
          <Button
            variant="ghost"
            disabled={unreadCount === 0 || markAll.isPending}
            onClick={() => markAll.mutate({ userId: user.id })}
          >
            Mark all read
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <NotificationsFilterTabs counts={{ all: total, unread: unreadCount, read: total - unreadCount }} />
        <span className="text-xs text-muted-foreground">Showing {items?.length ?? 0}</span>
      </div>

      <Card className="p-0">
        {items?.length === 0 ? (
          <EmptyState
            icon={CheckmarkCircle02Icon}
            title={tab === "unread" ? "Inbox zero" : "No notifications"}
          />
        ) : (
          <ul className="divide-y">
            {items?.map((n) => <NotificationRow key={n.id} notification={n} userId={user.id} />)}
          </ul>
        )}
      </Card>
    </div>
  );
}
```

### `components/notifications-filter-tabs.tsx`

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";

export function NotificationsFilterTabs({ counts }) {
  const tab = useNotificationsFilterStore((s) => s.tab);
  const setTab = useNotificationsFilterStore((s) => s.setTab);
  return (
    <ToggleGroup type="single" value={tab} onValueChange={(v) => v && setTab(v as any)}>
      <ToggleGroupItem value="all">All <Badge variant="secondary" className="ml-1">{counts.all}</Badge></ToggleGroupItem>
      <ToggleGroupItem value="unread">Unread <Badge variant="secondary" className="ml-1">{counts.unread}</Badge></ToggleGroupItem>
      <ToggleGroupItem value="read">Read <Badge variant="secondary" className="ml-1">{counts.read}</Badge></ToggleGroupItem>
    </ToggleGroup>
  );
}
```

### `components/notification-row.tsx`

```tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { NOTIFICATION_META, notificationLabel } from "../utils/notification-meta";
import { formatRelative } from "@/shared/lib/format";
import { useMarkRead } from "../hooks/use-mark-read";

export function NotificationRow({ notification, userId }) {
  const meta = NOTIFICATION_META[notification.type];
  const mark = useMarkRead();

  return (
    <li className={cn(
      "flex items-start gap-3 p-4",
      !notification.read && "bg-primary/5",
    )}>
      <div className={cn(
        "grid size-8 flex-shrink-0 place-items-center rounded-md",
        meta.tone === "success" && "bg-status-success-bg text-status-success-fg",
        meta.tone === "danger" && "bg-status-danger-bg text-status-danger-fg",
        meta.tone === "info" && "bg-status-info-bg text-status-info-fg",
        meta.tone === "pending" && "bg-status-pending-bg text-status-pending-fg",
      )}>
        <HugeiconsIcon icon={meta.icon} className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {!notification.read ? <span className="size-1.5 rounded-full bg-primary" /> : null}
          <span className={cn("text-sm", !notification.read ? "font-semibold" : "font-medium")}>
            {notificationLabel(notification.type)}
          </span>
        </div>
        <p className="mt-0.5 text-[12.8px] text-muted-foreground">{notification.message}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">{formatRelative(notification.createdAt)}</span>
        {!notification.read ? (
          <Button size="sm" variant="ghost" onClick={() => mark.mutate({ id: notification.id, userId })}>
            Mark read
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground/60">Read</span>
        )}
      </div>
    </li>
  );
}
```

### `hooks/use-notifications-list.ts`

```ts
export function useNotificationsList(userId: string | undefined, read?: boolean) {
  return useQuery({
    queryKey: ["notifications", "list", { userId, read }],
    queryFn: () => api.get<Notification[]>("/notifications", {
      userId: userId ?? "",
      ...(read !== undefined ? { read: String(read) } : {}),
    }),
    enabled: !!userId,
  });
}
```

### `hooks/use-notifications-count.ts`

Used by sidebar:

```ts
export function useNotificationsCount() {
  const { data: session } = useSession();
  const { data } = useNotificationsList(session?.user.id, false);
  return data?.length ?? 0;
}
```

### `hooks/use-mark-read.ts` & `use-mark-all-read.ts`

```ts
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      api.patch(`/notifications/${id}/read`, { userId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      api.patch(`/notifications/read-all`, { userId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
```

## Route

```tsx
// src/routes/dashboard/notifications.tsx
import { createFileRoute } from "@tanstack/react-router";
import { NotificationsContainer } from "@/features/notification/containers/notifications-container";

export const Route = createFileRoute("/dashboard/notifications")({
  component: NotificationsContainer,
});
```

## Acceptance Criteria

- Switch tab → list filtered.
- Mark read on item → row turns into "read" state, count updates.
- Mark all read → button disabled jika 0 unread.
- Sidebar Notifications badge sync dengan unread count.

## Commit

```
feat(dashboard): add notifications screen
```
