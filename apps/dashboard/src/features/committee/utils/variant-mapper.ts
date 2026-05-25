import type { ApplicationStatus } from "@/shared/lib/types";

export type StatusVariant = "draft" | "success" | "pending" | "danger" | "info";

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
