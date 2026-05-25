import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/shared/lib/format";
import { getInitials } from "@/shared/lib/string";
import type { CommitteeApplication } from "@/shared/lib/types";

import { useReviewApplication } from "../hooks/use-review-application";
import { applicationStatusVariant } from "../utils/variant-mapper";

type ApplicationRowProps = {
  application: CommitteeApplication;
  isLead: boolean;
  currentUserId: string;
};

function applicantLabel(userId: string): string {
  return `Applicant ${userId.slice(-4)}`;
}

export function ApplicationRow({
  application,
  isLead,
  currentUserId,
}: ApplicationRowProps) {
  const review = useReviewApplication();
  const label = applicantLabel(application.userId);

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
      <Avatar className="size-9">
        <AvatarFallback>{getInitials(label)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{label}</span>
          <code className="font-mono text-muted-foreground text-xs">
            {application.userId}
          </code>
        </div>
        <p className="mt-0.5 text-muted-foreground text-xs">
          Department unavailable
        </p>
        {application.motivation ? (
          <p className="mt-2 text-muted-foreground text-sm italic">
            "{application.motivation}"
          </p>
        ) : null}
        <p className="mt-2 text-muted-foreground text-xs">
          Applied {formatRelative(application.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
        <StatusBadge
          label={application.status}
          variant={applicationStatusVariant(application.status)}
        />
        {isLead && application.status === "pending" ? (
          <div className="flex gap-1">
            <Button
              disabled={review.isPending}
              onClick={() => {
                review.mutate({
                  applicationId: application.id,
                  reviewerId: currentUserId,
                  status: "accepted",
                });
              }}
              size="sm"
              type="button"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} />
              Accept
            </Button>
            <Button
              disabled={review.isPending}
              onClick={() => {
                review.mutate({
                  applicationId: application.id,
                  reviewerId: currentUserId,
                  status: "rejected",
                });
              }}
              size="sm"
              type="button"
              variant="destructive"
            >
              <HugeiconsIcon icon={CancelCircleIcon} />
              Reject
            </Button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
