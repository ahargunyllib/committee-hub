import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  RepeatIcon,
  TicketStarIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import type { NotificationType } from "@/shared/lib/types";

export type NotificationTone = "success" | "danger" | "info" | "pending";

export const NOTIFICATION_META: Record<
  NotificationType,
  { icon: IconSvgElement; tone: NotificationTone }
> = {
  proposal_approved: { icon: CheckmarkCircle02Icon, tone: "success" },
  proposal_rejected: { icon: CancelCircleIcon, tone: "danger" },
  proposal_revision_requested: { icon: RepeatIcon, tone: "info" },
  application_accepted: { icon: UserGroupIcon, tone: "success" },
  application_rejected: { icon: UserGroupIcon, tone: "danger" },
  registration_success: { icon: TicketStarIcon, tone: "success" },
};

export function notificationLabel(type: NotificationType): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
