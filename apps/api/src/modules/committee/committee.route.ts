import { Elysia, t } from "elysia";
import type { SessionAuth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import type { CommitteeService } from "./committee.service";

const applicationDecision = t.Union([
  t.Literal("accepted"),
  t.Literal("rejected"),
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

export const createCommitteeRoutes = (
  auth: SessionAuth,
  committeeService: CommitteeService
) =>
  new Elysia({
    name: "committee-routes",
    prefix: "/committee",
  })
    .get(
      "/events/:eventId/divisions",
      ({ params }) => committeeService.listDivisionsByEvent(params.eventId),
      {
        params: t.Object({
          eventId: t.String(),
        }),
        detail: {
          summary: "List committee divisions for an event",
          tags: ["Committee"],
        },
      }
    )
    .post(
      "/events/:eventId/divisions",
      ({ body, params }) =>
        committeeService.createDivision({
          ...body,
          eventId: params.eventId,
        }),
      {
        params: t.Object({
          eventId: t.String(),
        }),
        body: t.Object({
          description: t.Optional(t.String()),
          name: t.String(),
          quota: t.Number({ minimum: 1 }),
        }),
        detail: {
          summary: "Create a committee division",
          tags: ["Committee"],
        },
      }
    )
    .patch(
      "/divisions/:divisionId",
      ({ body, params }) =>
        committeeService.updateDivision(params.divisionId, body),
      {
        params: t.Object({
          divisionId: t.String(),
        }),
        body: t.Object({
          description: t.Optional(t.String()),
          name: t.Optional(t.String()),
          quota: t.Optional(t.Number({ minimum: 1 })),
        }),
        detail: {
          summary: "Update a committee division",
          tags: ["Committee"],
        },
      }
    )
    .post(
      "/divisions/:divisionId/applications",
      async ({ body, params, request }) =>
        committeeService.createApplication({
          ...body,
          divisionId: params.divisionId,
          userId: await requireAuthenticatedSession(auth, request.headers),
        }),
      {
        params: t.Object({
          divisionId: t.String(),
        }),
        body: t.Object({
          motivation: t.Optional(t.String()),
        }),
        detail: {
          summary: "Apply to a committee division",
          tags: ["Committee"],
        },
      }
    )
    .get(
      "/divisions/:divisionId/applications",
      ({ params }) =>
        committeeService.listApplicationsByDivision(params.divisionId),
      {
        params: t.Object({
          divisionId: t.String(),
        }),
        detail: {
          summary: "List committee applications for a division",
          tags: ["Committee"],
        },
      }
    )
    .patch(
      "/applications/:applicationId/review",
      async ({ body, params, request }) =>
        committeeService.reviewApplication(params.applicationId, {
          ...body,
          reviewerId: await requireAuthenticatedSession(auth, request.headers),
        }),
      {
        params: t.Object({
          applicationId: t.String(),
        }),
        body: t.Object({
          status: applicationDecision,
        }),
        detail: {
          summary: "Review a committee application",
          tags: ["Committee"],
        },
      }
    );
