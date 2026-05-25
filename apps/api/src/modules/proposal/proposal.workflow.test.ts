import { describe, expect, test } from "bun:test";
import { AppError } from "../../lib/errors";
import {
  getNextProposalReviewStatus,
  getRequiredApprovalLevels,
} from "./proposal.repository";
import type { ProposalApproval } from "./proposal.schema";

const approvedAt = (
  level: ProposalApproval["level"]
): Pick<ProposalApproval, "decision" | "level"> => ({
  decision: "approved",
  level,
});

describe("proposal approval workflow", () => {
  test("requires only ormawa approval for ormawa-scoped proposals", () => {
    expect(getRequiredApprovalLevels("ormawa")).toEqual(["ormawa"]);

    const nextStatus = getNextProposalReviewStatus({
      approvals: [],
      decision: "approved",
      level: "ormawa",
      scope: "ormawa",
    });

    expect(nextStatus).toBe("approved");
  });

  test("keeps fakultas-scoped proposals pending after ormawa approval", () => {
    const nextStatus = getNextProposalReviewStatus({
      approvals: [],
      decision: "approved",
      level: "ormawa",
      scope: "fakultas",
    });

    expect(nextStatus).toBe("pending");
  });

  test("approves universitas-scoped proposals only after all levels approve", () => {
    const nextStatus = getNextProposalReviewStatus({
      approvals: [approvedAt("ormawa"), approvedAt("fakultas")],
      decision: "approved",
      level: "universitas",
      scope: "universitas",
    });

    expect(nextStatus).toBe("approved");
  });

  test("rejects out-of-order approvals", () => {
    expect(() =>
      getNextProposalReviewStatus({
        approvals: [],
        decision: "approved",
        level: "fakultas",
        scope: "fakultas",
      })
    ).toThrow(AppError);
  });

  test("rejects duplicate approval level in the same submission round", () => {
    expect(() =>
      getNextProposalReviewStatus({
        approvals: [approvedAt("ormawa")],
        decision: "approved",
        level: "ormawa",
        scope: "universitas",
      })
    ).toThrow(AppError);
  });

  test("stops workflow immediately when revision is requested", () => {
    const nextStatus = getNextProposalReviewStatus({
      approvals: [approvedAt("ormawa")],
      decision: "revision_requested",
      level: "fakultas",
      scope: "universitas",
    });

    expect(nextStatus).toBe("revision_requested");
  });
});
