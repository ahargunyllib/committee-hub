import {
  Calendar03Icon,
  Clock01Icon,
  Location01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatRelative } from "@/shared/lib/format";
import { canAccess, RESOURCES } from "@/shared/lib/permissions";
import type { Event } from "@/shared/lib/types";

import { useRegisterEvent } from "../hooks/use-register-event";
import { useUpdateEventStatus } from "../hooks/use-update-event-status";
import { eventStatusVariant } from "../utils/variant-mapper";

type EventCardProps = {
  event: Event;
  userId: string;
  userRole: string;
};

export function EventCard({ event, userId, userRole }: EventCardProps) {
  const updateStatus = useUpdateEventStatus();
  const register = useRegisterEvent();
  const canManage = canAccess(userRole, RESOURCES.CREATE_EVENT);

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{event.name}</h3>
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
            {event.description ?? "No description provided."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge
            dot
            label={event.status}
            variant={eventStatusVariant(event.status)}
          />
          <StatusBadge
            label={event.type}
            variant={event.type === "internal" ? "draft" : "info"}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t bg-muted/40 px-5 py-3 text-xs">
        <MetaItem bold icon={Calendar03Icon} text={formatDate(event.date)} />
        <MetaItem icon={Clock01Icon} text={formatRelative(event.date)} />
        <MetaItem icon={Location01Icon} text={event.location} />
        <MetaItem icon={UserGroupIcon} text={`quota ${event.quota}`} />
      </div>

      <div className="mt-auto flex items-center justify-between border-t bg-muted/50 px-5 py-3 text-xs">
        <code className="font-mono text-muted-foreground">{event.id}</code>
        <div className="flex items-center gap-2">
          {event.status === "open" && !canManage ? (
            <Button
              disabled={register.isPending}
              onClick={() => {
                register.mutate({ eventId: event.id, userId });
              }}
              size="sm"
              type="button"
            >
              Register
            </Button>
          ) : null}
          {canManage ? (
            <Button
              disabled={updateStatus.isPending}
              onClick={() => {
                updateStatus.mutate({
                  id: event.id,
                  status: nextStatus(event.status),
                });
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              {nextStatusLabel(event.status)}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function MetaItem({
  bold,
  icon,
  text,
}: {
  bold?: boolean;
  icon: IconSvgElement;
  text: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <HugeiconsIcon className="size-3.5 text-muted-foreground" icon={icon} />
      <span className={bold ? "truncate font-medium" : "truncate"}>{text}</span>
    </div>
  );
}

function nextStatus(status: Event["status"]): Event["status"] {
  if (status === "draft") {
    return "open";
  }
  if (status === "open") {
    return "closed";
  }
  return "open";
}

function nextStatusLabel(status: Event["status"]): string {
  if (status === "draft") {
    return "Open";
  }
  if (status === "open") {
    return "Close";
  }
  return "Reopen";
}
