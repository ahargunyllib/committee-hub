import type { StatusVariant } from "@/shared/components/status-badge";
import type {
  ApplicationStatus,
  EventStatus,
  ProposalStatus,
} from "@/shared/lib/types";

export function eventStatusVariant(status: EventStatus): StatusVariant {
  if (status === "open") {
    return "success";
  }
  return "draft";
}

export function proposalStatusVariant(status: ProposalStatus): StatusVariant {
  if (status === "approved") {
    return "success";
  }
  if (status === "rejected") {
    return "danger";
  }
  if (status === "revision_requested") {
    return "info";
  }
  return "pending";
}

export function applicationStatusVariant(
  status: ApplicationStatus
): StatusVariant {
  if (status === "accepted") {
    return "success";
  }
  if (status === "rejected") {
    return "danger";
  }
  return "pending";
}
