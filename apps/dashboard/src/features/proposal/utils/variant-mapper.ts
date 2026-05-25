import type { StatusVariant } from "@/shared/components/status-badge";
import type { ProposalDecision, ProposalStatus } from "@/shared/lib/types";

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

export function decisionVariant(decision: ProposalDecision): StatusVariant {
  if (decision === "approved") {
    return "success";
  }
  if (decision === "rejected") {
    return "danger";
  }
  return "info";
}
