import { Elysia, t } from "elysia";
import { db } from "../../db";
import { createCommitteeRepository } from "./committee.repository";
import { createCommitteeService } from "./committee.service";

const committeeService = createCommitteeService({
  repository: createCommitteeRepository(db),
});

const applicationDecision = t.Union([
  t.Literal("accepted"),
  t.Literal("rejected"),
]);

export const committeeRoutes = new Elysia({
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
    ({ body, params }) =>
      committeeService.createApplication({
        ...body,
        divisionId: params.divisionId,
      }),
    {
      params: t.Object({
        divisionId: t.String(),
      }),
      body: t.Object({
        motivation: t.Optional(t.String()),
        userId: t.String(),
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
    ({ body, params }) =>
      committeeService.reviewApplication(params.applicationId, body),
    {
      params: t.Object({
        applicationId: t.String(),
      }),
      body: t.Object({
        reviewerId: t.String(),
        status: applicationDecision,
      }),
      detail: {
        summary: "Review a committee application",
        tags: ["Committee"],
      },
    }
  );
