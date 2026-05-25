import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { formatRelative } from "@/shared/lib/format";
import type { Notification } from "@/shared/lib/types";

import { useMarkRead } from "../hooks/use-mark-read";
import { notificationLabel } from "../utils/notification-meta";
import { NotificationIcon } from "./notification-icon";

type NotificationRowProps = {
  notification: Notification;
};

export function NotificationRow({ notification }: NotificationRowProps) {
  const markRead = useMarkRead();

  return (
    <li
      className={cn(
        "flex flex-col gap-3 p-4 sm:flex-row sm:items-start",
        !notification.read && "bg-primary/5"
      )}
    >
      <NotificationIcon type={notification.type} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {notification.read ? null : (
            <span className="size-1.5 rounded-full bg-primary" />
          )}
          <span
            className={cn(
              "text-sm",
              notification.read ? "font-medium" : "font-semibold"
            )}
          >
            {notificationLabel(notification.type)}
          </span>
        </div>
        <p className="mt-1 text-muted-foreground text-xs">
          {notification.message}
        </p>
      </div>
      <div className="flex shrink-0 flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
        <span className="text-muted-foreground text-xs">
          {formatRelative(notification.createdAt)}
        </span>
        {notification.read ? (
          <span className="text-muted-foreground/60 text-xs">Read</span>
        ) : (
          <Button
            disabled={markRead.isPending}
            onClick={() => {
              markRead.mutate({ id: notification.id });
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} />
            Mark read
          </Button>
        )}
      </div>
    </li>
  );
}
