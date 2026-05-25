import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/shared/lib/auth";
import type { Notification } from "@/shared/lib/types";

import { NotificationRow } from "../components/notification-row";
import { NotificationsFilterTabs } from "../components/notifications-filter-tabs";
import { useMarkAllRead } from "../hooks/use-mark-all-read";
import { useNotificationsList } from "../hooks/use-notifications-list";
import { useNotificationsFilterStore } from "../stores/use-notifications-filter-store";

const skeletonRows = ["notification-1", "notification-2", "notification-3"];

export function NotificationsContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const tab = useNotificationsFilterStore((state) => state.tab);
  const markAllRead = useMarkAllRead();
  const allQuery = useNotificationsList(user?.id);
  const unreadQuery = useNotificationsList(user?.id, false);
  const readQuery = useNotificationsList(user?.id, true);

  if (!user) {
    return null;
  }

  const all = allQuery.data ?? [];
  const unread = unreadQuery.data ?? [];
  const read = readQuery.data ?? [];
  const items = getItemsForTab({ all, read, tab, unread });
  const unreadCount = unread.length;
  const total = all.length;
  const isPending =
    allQuery.isPending || unreadQuery.isPending || readQuery.isPending;
  const error =
    allQuery.error?.message ??
    unreadQuery.error?.message ??
    readQuery.error?.message;
  let listContent: ReactNode;

  if (isPending) {
    listContent = (
      <div className="space-y-2 p-4">
        {skeletonRows.map((row) => (
          <Skeleton className="h-16 w-full" key={row} />
        ))}
      </div>
    );
  } else if (items.length === 0) {
    listContent = (
      <EmptyState
        icon={CheckmarkCircle02Icon}
        title={tab === "unread" ? "Inbox zero" : "No notifications"}
      />
    );
  } else {
    listContent = (
      <ul className="divide-y">
        {items.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            userId={user.id}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button
            disabled={unreadCount === 0 || markAllRead.isPending}
            onClick={() => {
              markAllRead.mutate({ userId: user.id });
            }}
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} />
            Mark all read
          </Button>
        }
        subtitle={`${unreadCount} unread of ${total} total`}
        title="Notifications"
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <NotificationsFilterTabs
          counts={{
            all: total,
            read: read.length,
            unread: unreadCount,
          }}
        />
        <span className="text-muted-foreground text-xs">
          Showing {items.length}
        </span>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load notifications</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="p-0">{listContent}</Card>
    </div>
  );
}

function getItemsForTab({
  all,
  read,
  tab,
  unread,
}: {
  all: Notification[];
  read: Notification[];
  tab: "all" | "unread" | "read";
  unread: Notification[];
}): Notification[] {
  if (tab === "all") {
    return all;
  }
  if (tab === "unread") {
    return unread;
  }
  return read;
}
