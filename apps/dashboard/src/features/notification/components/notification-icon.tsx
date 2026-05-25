import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/shared/lib/utils";

import type { NotificationTone } from "../utils/notification-meta";
import { NOTIFICATION_META } from "../utils/notification-meta";
import type { NotificationType } from "@/shared/lib/types";

type NotificationIconProps = {
  type: NotificationType;
};

function toneClassName(tone: NotificationTone): string {
  if (tone === "success") {
    return "bg-status-success-bg text-status-success-fg";
  }
  if (tone === "danger") {
    return "bg-status-danger-bg text-status-danger-fg";
  }
  if (tone === "info") {
    return "bg-status-info-bg text-status-info-fg";
  }
  return "bg-status-pending-bg text-status-pending-fg";
}

export function NotificationIcon({ type }: NotificationIconProps) {
  const meta = NOTIFICATION_META[type];

  return (
    <div
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md",
        toneClassName(meta.tone)
      )}
    >
      <HugeiconsIcon className="size-4" icon={meta.icon} />
    </div>
  );
}
