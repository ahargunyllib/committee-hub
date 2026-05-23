import { Elysia, t } from "elysia";
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

export const createProposalRoutes = (proposalService: ProposalService) =>
  new Elysia({
    name: "proposal-routes",
    prefix: "/proposals",
  })
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
    .post("/", ({ body }) => proposalService.createProposal(body), {
      body: t.Object({
        description: t.Optional(t.String()),
        documentUrl: t.Optional(t.String()),
        eventId: t.String(),
        scope: proposalScope,
        submittedById: t.String(),
        title: t.String(),
      }),
      detail: {
        summary: "Create a proposal",
        tags: ["Proposal"],
      },
    })
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
      ({ body, params }) =>
        proposalService.updateProposal(params.proposalId, body),
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
      ({ params }) => proposalService.submitProposal(params.proposalId),
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
      ({ body, params }) =>
        proposalService.reviewProposal(params.proposalId, body),
      {
        params: t.Object({
          proposalId: t.String(),
        }),
        body: t.Object({
          decision: proposalDecision,
          level: proposalScope,
          notes: t.Optional(t.String()),
          reviewerId: t.String(),
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
