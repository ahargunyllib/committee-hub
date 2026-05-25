import type { DB } from "../../db";
import { userTable, type UserRole } from "../../db/auth.schema";
import { AppError } from "../../lib/errors";
import { and, asc, eq } from "drizzle-orm";
import type { Event } from "../event/event.schema";
import { eventTable } from "../event/event.schema";
import type { Proposal, ProposalApproval } from "./proposal.schema";
import { proposalApprovalTable, proposalTable } from "./proposal.schema";

export type ListProposalsInput = {
  scope?: Proposal["scope"];
  status?: Proposal["status"];
  submittedById?: string;
};

export type CreateProposalInput = {
  description?: string;
  documentUrl?: string;
  eventId: string;
  scope: Proposal["scope"];
  submittedById: string;
  title: string;
};

export type UpdateProposalInput = Partial<
  Pick<CreateProposalInput, "description" | "documentUrl" | "scope" | "title">
>;

export type ReviewProposalInput = {
  decision: ProposalApproval["decision"];
  level: ProposalApproval["level"];
  notes?: string;
  reviewerId: string;
};

export type ProposalRepository = {
  listProposals: (input: ListProposalsInput) => Promise<Proposal[]>;
  createProposal: (input: CreateProposalInput) => Promise<Proposal>;
  getEventById: (eventId: string) => Promise<Event | null>;
  getProposalById: (proposalId: string) => Promise<Proposal | null>;
  getProposalByEventId: (eventId: string) => Promise<Proposal | null>;
  getUserRoleById: (userId: string) => Promise<UserRole | null>;
  updateProposal: (
    proposalId: string,
    input: UpdateProposalInput
  ) => Promise<Proposal>;
  submitProposal: (proposalId: string) => Promise<Proposal>;
  reviewProposal: (
    proposalId: string,
    input: ReviewProposalInput
  ) => Promise<ProposalApproval>;
  listApprovals: (proposalId: string) => Promise<ProposalApproval[]>;
};

const requiredApprovalLevelsByScope = {
  fakultas: ["ormawa", "fakultas"],
  ormawa: ["ormawa"],
  universitas: ["ormawa", "fakultas", "universitas"],
} as const satisfies Record<Proposal["scope"], ProposalApproval["level"][]>;

type ReviewWorkflowInput = {
  approvals: Pick<ProposalApproval, "decision" | "level">[];
  decision: ProposalApproval["decision"];
  level: ProposalApproval["level"];
  scope: Proposal["scope"];
};

export const getRequiredApprovalLevels = (
  scope: Proposal["scope"]
): ProposalApproval["level"][] => [...requiredApprovalLevelsByScope[scope]];

export const getNextProposalReviewStatus = ({
  approvals,
  decision,
  level,
  scope,
}: ReviewWorkflowInput): Proposal["status"] => {
  const hasReviewedLevel = approvals.some(
    (approval) => approval.level === level
  );

  if (hasReviewedLevel) {
    throw new AppError(
      "CONFLICT",
      "This approval level has already reviewed the current submission round"
    );
  }

  const approvedLevels = approvals
    .filter((approval) => approval.decision === "approved")
    .map((approval) => approval.level);
  const requiredLevels = requiredApprovalLevelsByScope[scope];
  const expectedLevel = requiredLevels[approvedLevels.length];

  if (level !== expectedLevel) {
    throw new AppError("CONFLICT", `Expected ${expectedLevel} review next`);
  }

  const isFinalApproval =
    decision === "approved" &&
    approvedLevels.length + 1 === requiredLevels.length;

  if (decision === "approved" && !isFinalApproval) {
    return "pending";
  }

  return decision;
};

const firstOrNotFound = <T>(rows: T[], message: string): T => {
  const [row] = rows;

  if (!row) {
    throw new AppError("NOT_FOUND", message);
  }

  return row;
};

export const createProposalRepository = (db: DB): ProposalRepository => ({
  // Query proposals by reviewer-facing filters such as status, scope, and submitter.
  listProposals: (input) => {
    const filters = [
      input.scope ? eq(proposalTable.scope, input.scope) : undefined,
      input.status ? eq(proposalTable.status, input.status) : undefined,
      input.submittedById
        ? eq(proposalTable.submittedById, input.submittedById)
        : undefined,
    ].filter((filter) => filter !== undefined);

    const query = db.select().from(proposalTable);

    if (filters.length === 0) {
      return query.orderBy(asc(proposalTable.createdAt));
    }

    return query.where(and(...filters)).orderBy(asc(proposalTable.createdAt));
  },
  // Insert the proposal linked to one event and submitter; unique event FK keeps one proposal per event.
  createProposal: async (input) => {
    const rows = await db.insert(proposalTable).values(input).returning();

    return firstOrNotFound(rows, "Proposal was not created");
  },
  // Fetch event ownership for proposal submission invariants.
  getEventById: async (eventId) => {
    const [event] = await db
      .select()
      .from(eventTable)
      .where(eq(eventTable.id, eventId))
      .limit(1);

    return event ?? null;
  },
  // Fetch one proposal by primary key; service decides whether null becomes not-found.
  getProposalById: async (proposalId) => {
    const [proposal] = await db
      .select()
      .from(proposalTable)
      .where(eq(proposalTable.id, proposalId))
      .limit(1);

    return proposal ?? null;
  },
  // Fetch proposal by event to enforce the one-proposal-per-event workflow before insert.
  getProposalByEventId: async (eventId) => {
    const [proposal] = await db
      .select()
      .from(proposalTable)
      .where(eq(proposalTable.eventId, eventId))
      .limit(1);

    return proposal ?? null;
  },
  // Read reviewer/submitter role from Better Auth user table as shared auth infrastructure.
  getUserRoleById: async (userId) => {
    const [user] = await db
      .select({ role: userTable.role })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    return user?.role ?? null;
  },
  // Apply revisions to draft/revision-requested proposal fields before resubmission.
  updateProposal: async (proposalId, input) => {
    const rows = await db
      .update(proposalTable)
      .set(input)
      .where(eq(proposalTable.id, proposalId))
      .returning();

    return firstOrNotFound(rows, "Proposal not found");
  },
  // Move a proposal into pending review and increment submission round when resubmitting.
  submitProposal: async (proposalId) => {
    const proposal = await db.query.proposalTable.findFirst({
      where: eq(proposalTable.id, proposalId),
    });

    if (!proposal) {
      throw new AppError("NOT_FOUND", "Proposal not found");
    }

    if (
      proposal.status !== "pending" &&
      proposal.status !== "revision_requested"
    ) {
      throw new AppError(
        "CONFLICT",
        "Only pending proposals or requested revisions can be submitted"
      );
    }

    const rows = await db
      .update(proposalTable)
      .set({
        status: "pending",
        submissionRound:
          proposal.status === "revision_requested"
            ? proposal.submissionRound + 1
            : proposal.submissionRound,
        submittedAt: new Date(),
      })
      .where(eq(proposalTable.id, proposalId))
      .returning();

    return firstOrNotFound(rows, "Proposal not found");
  },
  // Insert approval history and update proposal status in one transaction.
  reviewProposal: (proposalId, input) =>
    db.transaction(async (tx) => {
      const proposal = await tx.query.proposalTable.findFirst({
        where: eq(proposalTable.id, proposalId),
      });

      if (!proposal) {
        throw new AppError("NOT_FOUND", "Proposal not found");
      }

      if (proposal.status !== "pending") {
        throw new AppError(
          "CONFLICT",
          "Only pending proposals can be reviewed"
        );
      }

      const approvals = await tx
        .select()
        .from(proposalApprovalTable)
        .where(
          and(
            eq(proposalApprovalTable.proposalId, proposalId),
            eq(proposalApprovalTable.submissionRound, proposal.submissionRound)
          )
        )
        .orderBy(asc(proposalApprovalTable.createdAt));

      const nextStatus = getNextProposalReviewStatus({
        approvals,
        decision: input.decision,
        level: input.level,
        scope: proposal.scope,
      });

      const approvalRows = await tx
        .insert(proposalApprovalTable)
        .values({
          ...input,
          proposalId,
          submissionRound: proposal.submissionRound,
        })
        .returning();

      await tx
        .update(proposalTable)
        .set({
          status: nextStatus,
        })
        .where(eq(proposalTable.id, proposalId));

      return firstOrNotFound(approvalRows, "Proposal review was not saved");
    }),
  // Return full approval history ordered by submission round and creation time.
  listApprovals: (proposalId) =>
    db
      .select()
      .from(proposalApprovalTable)
      .where(eq(proposalApprovalTable.proposalId, proposalId))
      .orderBy(
        asc(proposalApprovalTable.submissionRound),
        asc(proposalApprovalTable.createdAt)
      ),
});
