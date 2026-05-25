import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Elysia } from "elysia";
import { AppError } from "../../lib/errors";
import type {
  CreateProposalInput,
  ListProposalsInput,
  ReviewProposalInput,
  UpdateProposalInput,
} from "./proposal.repository";
import type { ProposalService } from "./proposal.service";
import type { Proposal, ProposalApproval } from "./proposal.schema";

type MockSession = {
  user: {
    id: string;
    role: string;
  };
} | null;

let currentSession: MockSession = null;

mock.module("../../lib/auth", () => ({
  auth: {
    api: {
      getSession: async () => currentSession,
    },
  },
}));

const { createProposalRoutes } = await import("./proposal.route");

const now = new Date("2026-01-01T00:00:00.000Z");

const proposalFixture = (override: Partial<Proposal> = {}): Proposal => ({
  createdAt: now,
  description: "Budget and event rundown",
  documentUrl: "https://example.com/proposal.pdf",
  eventId: "evt_1",
  id: "prp_1",
  scope: "fakultas",
  status: "pending",
  submissionRound: 1,
  submittedAt: now,
  submittedById: "usr_actor",
  title: "Campus Talk",
  updatedAt: now,
  ...override,
});

const approvalFixture = (
  override: Partial<ProposalApproval> = {}
): ProposalApproval => ({
  createdAt: now,
  decision: "approved",
  id: "apr_1",
  level: "ormawa",
  notes: "Approved",
  proposalId: "prp_1",
  reviewerId: "usr_actor",
  submissionRound: 1,
  ...override,
});

type CapturedCalls = {
  createProposal?: CreateProposalInput;
  listProposals?: ListProposalsInput;
  reviewProposal?: ReviewProposalInput;
  submitProposal?: {
    actorUserId: string;
    proposalId: string;
  };
  updateProposal?: {
    actorUserId: string;
    input: UpdateProposalInput;
    proposalId: string;
  };
};

const createTestApp = (capturedCalls: CapturedCalls) => {
  const proposalService = {
    createProposal: (input) => {
      capturedCalls.createProposal = input;
      return Promise.resolve(
        proposalFixture({ submittedById: input.submittedById })
      );
    },
    getProposalById: (proposalId) =>
      Promise.resolve(proposalFixture({ id: proposalId })),
    listApprovals: (proposalId) =>
      Promise.resolve([approvalFixture({ proposalId })]),
    listProposals: (input) => {
      capturedCalls.listProposals = input;
      return Promise.resolve([proposalFixture()]);
    },
    reviewProposal: (_proposalId, input) => {
      capturedCalls.reviewProposal = input;
      return Promise.resolve(approvalFixture({ reviewerId: input.reviewerId }));
    },
    submitProposal: (proposalId, actorUserId) => {
      capturedCalls.submitProposal = { actorUserId, proposalId };
      return Promise.resolve(proposalFixture({ id: proposalId }));
    },
    updateProposal: (proposalId, actorUserId, input) => {
      capturedCalls.updateProposal = {
        actorUserId,
        input,
        proposalId,
      };
      return Promise.resolve(proposalFixture({ id: proposalId, ...input }));
    },
  } satisfies ProposalService;

  return new Elysia()
    .onError(({ error, set }) => {
      if (error instanceof AppError) {
        set.status = error.status;

        return {
          error: {
            code: error.code,
            message: error.message,
          },
        };
      }

      throw error;
    })
    .use(createProposalRoutes(proposalService));
};

describe("proposal routes", () => {
  beforeEach(() => {
    currentSession = {
      user: {
        id: "usr_actor",
        role: "ketua_panitia",
      },
    };
  });

  test("requires authentication", async () => {
    currentSession = null;
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/proposals")
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("uses authenticated actor as proposal submitter", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/proposals", {
        body: JSON.stringify({
          eventId: "evt_1",
          scope: "fakultas",
          submittedById: "usr_spoofed",
          title: "Campus Talk",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.createProposal?.submittedById).toBe("usr_actor");
  });

  test("uses authenticated actor for proposal revision", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/proposals/prp_1", {
        body: JSON.stringify({
          title: "Updated Campus Talk",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.updateProposal).toEqual({
      actorUserId: "usr_actor",
      input: {
        title: "Updated Campus Talk",
      },
      proposalId: "prp_1",
    });
  });

  test("uses authenticated actor for proposal submission", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/proposals/prp_1/submit", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.submitProposal).toEqual({
      actorUserId: "usr_actor",
      proposalId: "prp_1",
    });
  });

  test("uses authenticated actor as proposal reviewer", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/proposals/prp_1/reviews", {
        body: JSON.stringify({
          decision: "approved",
          level: "ormawa",
          reviewerId: "usr_spoofed",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.reviewProposal?.reviewerId).toBe("usr_actor");
  });
});
