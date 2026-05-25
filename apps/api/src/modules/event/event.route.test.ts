import { beforeEach, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import type { AuthSession, SessionAuth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import type {
  CreateEventInput,
  ListEventsInput,
  UpdateEventInput,
} from "./event.repository";
import type { EventService } from "./event.service";
import type { Event, Registration, Ticket } from "./event.schema";

type ErrorResponseBody = {
  error: {
    code: string;
  };
};

let currentSession: AuthSession = null;

const createTestAuth = (): SessionAuth => ({
  api: {
    getSession: async () => currentSession,
  },
});

const { createEventRoutes } = await import("./event.route");

const now = new Date("2026-01-01T00:00:00.000Z");

const eventFixture = (override: Partial<Event> = {}): Event => ({
  createdAt: now,
  createdById: "usr_actor",
  date: now,
  description: "Campus expo",
  id: "evt_1",
  location: "Auditorium",
  name: "Campus Expo",
  quota: 100,
  status: "draft",
  type: "internal",
  updatedAt: now,
  ...override,
});

const registrationFixture = (
  override: Partial<Registration> = {}
): Registration => ({
  createdAt: now,
  eventId: "evt_1",
  id: "reg_1",
  userId: "usr_actor",
  ...override,
});

const ticketFixture = (override: Partial<Ticket> = {}): Ticket => ({
  code: "CMTHB-TEST-0001",
  createdAt: now,
  id: "tkt_1",
  registrationId: "reg_1",
  status: "active",
  updatedAt: now,
  usedAt: null,
  ...override,
});

type CapturedCalls = {
  createEvent?: CreateEventInput;
  registerParticipant?: {
    eventId: string;
    userId: string;
  };
};

const createTestApp = (capturedCalls: CapturedCalls) => {
  const eventService = {
    createEvent: (input) => {
      capturedCalls.createEvent = input;
      return Promise.resolve(eventFixture({ createdById: input.createdById }));
    },
    deleteEvent: () => Promise.resolve({ deleted: true }),
    getEventById: (eventId) => Promise.resolve(eventFixture({ id: eventId })),
    listEvents: (_input: ListEventsInput) => Promise.resolve([eventFixture()]),
    listRegistrations: (eventId) =>
      Promise.resolve([registrationFixture({ eventId })]),
    registerParticipant: (eventId, userId) => {
      capturedCalls.registerParticipant = { eventId, userId };
      return Promise.resolve(registrationFixture({ eventId, userId }));
    },
    updateEvent: (eventId, input: UpdateEventInput) => {
      const { date, ...rest } = input;
      const override: Partial<Event> = { id: eventId, ...rest };

      if (date) {
        override.date = new Date(date);
      }

      return Promise.resolve(eventFixture(override));
    },
    verifyTicket: (ticketCode) =>
      Promise.resolve(ticketFixture({ code: ticketCode })),
  } satisfies EventService;

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
    .use(createEventRoutes(createTestAuth(), eventService));
};

describe("event routes", () => {
  beforeEach(() => {
    currentSession = {
      user: {
        id: "usr_actor",
        role: "ketua_panitia",
      },
    };
  });

  test("requires authentication when creating an event", async () => {
    currentSession = null;
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/events", {
        body: JSON.stringify({
          date: "2026-02-01T00:00:00.000Z",
          location: "Auditorium",
          name: "Campus Expo",
          quota: 100,
          type: "internal",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );
    const body = await response.json<ErrorResponseBody>();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("uses authenticated actor as event creator", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/events", {
        body: JSON.stringify({
          createdById: "usr_spoofed",
          date: "2026-02-01T00:00:00.000Z",
          location: "Auditorium",
          name: "Campus Expo",
          quota: 100,
          type: "internal",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.createEvent?.createdById).toBe("usr_actor");
  });

  test("uses authenticated actor for event registration", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/events/evt_1/registrations", {
        body: JSON.stringify({
          userId: "usr_spoofed",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.registerParticipant).toEqual({
      eventId: "evt_1",
      userId: "usr_actor",
    });
  });
});
