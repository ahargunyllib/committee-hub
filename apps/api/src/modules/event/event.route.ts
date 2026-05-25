import { Elysia, t } from "elysia";
import type { SessionAuth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import type { EventService } from "./event.service";

const eventType = t.Union([t.Literal("internal"), t.Literal("external")]);
const eventStatus = t.Union([
  t.Literal("draft"),
  t.Literal("open"),
  t.Literal("closed"),
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

export const createEventRoutes = (
  auth: SessionAuth,
  eventService: EventService
) =>
  new Elysia({
    name: "event-routes",
    prefix: "/events",
  })
    .get("/", ({ query }) => eventService.listEvents(query), {
      query: t.Object({
        search: t.Optional(t.String()),
        status: t.Optional(eventStatus),
        type: t.Optional(eventType),
      }),
      detail: {
        summary: "List events",
        tags: ["Event"],
      },
    })
    .post(
      "/",
      async ({ body, request }) =>
        eventService.createEvent({
          ...body,
          createdById: await requireAuthenticatedSession(auth, request.headers),
        }),
      {
        body: t.Object({
          date: t.String({ format: "date-time" }),
          description: t.Optional(t.String()),
          location: t.String(),
          name: t.String(),
          quota: t.Number({ minimum: 1 }),
          type: eventType,
        }),
        detail: {
          summary: "Create an event",
          tags: ["Event"],
        },
      }
    )
    .get(
      "/:eventId",
      ({ params }) => eventService.getEventById(params.eventId),
      {
        params: t.Object({
          eventId: t.String(),
        }),
        detail: {
          summary: "Get event by id",
          tags: ["Event"],
        },
      }
    )
    .patch(
      "/:eventId",
      ({ body, params }) => eventService.updateEvent(params.eventId, body),
      {
        params: t.Object({
          eventId: t.String(),
        }),
        body: t.Object({
          date: t.Optional(t.String({ format: "date-time" })),
          description: t.Optional(t.String()),
          location: t.Optional(t.String()),
          name: t.Optional(t.String()),
          quota: t.Optional(t.Number({ minimum: 1 })),
          status: t.Optional(eventStatus),
          type: t.Optional(eventType),
        }),
        detail: {
          summary: "Update an event",
          tags: ["Event"],
        },
      }
    )
    .delete(
      "/:eventId",
      ({ params }) => eventService.deleteEvent(params.eventId),
      {
        params: t.Object({
          eventId: t.String(),
        }),
        detail: {
          summary: "Delete an event",
          tags: ["Event"],
        },
      }
    )
    .post(
      "/:eventId/registrations",
      async ({ params, request }) =>
        eventService.registerParticipant(
          params.eventId,
          await requireAuthenticatedSession(auth, request.headers)
        ),
      {
        params: t.Object({
          eventId: t.String(),
        }),
        detail: {
          summary: "Register a participant for an event",
          tags: ["Event"],
        },
      }
    )
    .get(
      "/:eventId/registrations",
      ({ params }) => eventService.listRegistrations(params.eventId),
      {
        params: t.Object({
          eventId: t.String(),
        }),
        detail: {
          summary: "List event registrations",
          tags: ["Event"],
        },
      }
    )
    .post(
      "/tickets/:ticketCode/verify",
      ({ params }) => eventService.verifyTicket(params.ticketCode),
      {
        params: t.Object({
          ticketCode: t.String(),
        }),
        detail: {
          summary: "Verify a ticket code",
          tags: ["Event"],
        },
      }
    );
