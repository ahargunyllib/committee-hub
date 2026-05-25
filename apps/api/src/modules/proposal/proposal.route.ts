import { Elysia, t } from "elysia";
import type { SessionAuth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import type { ProposalService } from "./proposal.service";

const proposalScope = t.Union([
  t.Literal("ormawa"),
  t.Literal("fakultas"),
  t.Literal("universitas"),
]);

const proposalStatus = t.Union([
  t.Literal("pending"),
  t.Literal("approved"),
  t.Literal("rejected"),
  t.Literal("revision_requested"),
]);

const proposalDecision = t.Union([
  t.Literal("approved"),
  t.Literal("rejected"),
  t.Literal("revision_requested"),
]);

const requireAuthenticatedSession = async (
  auth: SessionAuth,
  headers: Headers
): Promise<string> => {
  const authSession = await auth.api.getSession({
    headers,
  });

  if (!authSession) {
    throw new AppError("UNAUTHORIZED", "Authentication is required");
  }

  return authSession.user.id;
};

export const createProposalRoutes = (
  auth: SessionAuth,
  proposalService: ProposalService
) =>
  new Elysia({
    name: "proposal-routes",
    prefix: "/proposals",
  })
    .derive(async ({ request }) => ({
      actorUserId: await requireAuthenticatedSession(auth, request.headers),
    }))
    .get("/", ({ query }) => proposalService.listProposals(query), {
      query: t.Object({
        scope: t.Optional(proposalScope),
        status: t.Optional(proposalStatus),
        submittedById: t.Optional(t.String()),
      }),
      detail: {
        summary: "List proposals",
        tags: ["Proposal"],
      },
    })
    .post(
      "/",
      ({ actorUserId, body }) =>
        proposalService.createProposal({
          ...body,
          submittedById: actorUserId,
        }),
      {
        body: t.Object({
          description: t.Optional(t.String()),
          documentUrl: t.Optional(t.String()),
          eventId: t.String(),
          scope: proposalScope,
          title: t.String(),
        }),
        detail: {
          summary: "Create a proposal",
          tags: ["Proposal"],
        },
      }
    )
    .get(
      "/:proposalId",
      ({ params }) => proposalService.getProposalById(params.proposalId),
      {
        params: t.Object({
          proposalId: t.String(),
        }),
        detail: {
          summary: "Get proposal by id",
          tags: ["Proposal"],
        },
      }
    )
    .patch(
      "/:proposalId",
      ({ actorUserId, body, params }) =>
        proposalService.updateProposal(params.proposalId, actorUserId, body),
      {
        params: t.Object({
          proposalId: t.String(),
        }),
        body: t.Object({
          description: t.Optional(t.String()),
          documentUrl: t.Optional(t.String()),
          scope: t.Optional(proposalScope),
          title: t.Optional(t.String()),
        }),
        detail: {
          summary: "Revise a proposal",
          tags: ["Proposal"],
        },
      }
    )
    .post(
      "/:proposalId/submit",
      ({ actorUserId, params }) =>
        proposalService.submitProposal(params.proposalId, actorUserId),
      {
        params: t.Object({
          proposalId: t.String(),
        }),
        detail: {
          summary: "Submit or resubmit a proposal",
          tags: ["Proposal"],
        },
      }
    )
    .post(
      "/:proposalId/reviews",
      ({ actorUserId, body, params }) =>
        proposalService.reviewProposal(params.proposalId, {
          ...body,
          reviewerId: actorUserId,
        }),
      {
        params: t.Object({
          proposalId: t.String(),
        }),
        body: t.Object({
          decision: proposalDecision,
          level: proposalScope,
          notes: t.Optional(t.String()),
        }),
        detail: {
          summary: "Review a proposal",
          tags: ["Proposal"],
        },
      }
    )
    .get(
      "/:proposalId/approvals",
      ({ params }) => proposalService.listApprovals(params.proposalId),
      {
        params: t.Object({
          proposalId: t.String(),
        }),
        detail: {
          summary: "List proposal approval history",
          tags: ["Proposal"],
        },
      }
    );
