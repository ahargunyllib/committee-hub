import { beforeEach, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import type { AuthSession, SessionAuth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import type {
  CreateNotificationInput,
  ListNotificationsInput,
} from "./notification.repository";
import type { Notification } from "./notification.schema";
import type { NotificationService } from "./notification.service";

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

const { createNotificationRoutes } = await import("./notification.route");

const now = new Date("2026-01-01T00:00:00.000Z");

const notificationFixture = (
  override: Partial<Notification> = {}
): Notification => ({
  createdAt: now,
  id: "ntf_1",
  message: "Proposal approved",
  read: false,
  readAt: null,
  referenceId: "prp_1",
  referenceType: "proposal",
  type: "proposal_approved",
  userId: "usr_actor",
  ...override,
});

type CapturedCalls = {
  createNotification?: CreateNotificationInput;
  listNotifications?: ListNotificationsInput;
  markAllAsRead?: string;
  markAsRead?: {
    notificationId: string;
    userId: string;
  };
};

const createTestApp = (capturedCalls: CapturedCalls) => {
  const notificationService = {
    createNotification: (input) => {
      capturedCalls.createNotification = input;

      return Promise.resolve(notificationFixture(input));
    },
    handleCommitteeApplicationReviewed: (payload) =>
      Promise.resolve(
        notificationFixture({
          referenceId: payload.applicationId,
          type:
            payload.status === "accepted"
              ? "application_accepted"
              : "application_rejected",
          userId: payload.recipientUserId,
        })
      ),
    handleEventRegistrationCreated: (payload) =>
      Promise.resolve(
        notificationFixture({
          referenceId: payload.registrationId,
          type: "registration_success",
          userId: payload.recipientUserId,
        })
      ),
    handleProposalStatusChanged: (payload) =>
      Promise.resolve(
        notificationFixture({
          referenceId: payload.proposalId,
          type:
            payload.status === "approved"
              ? "proposal_approved"
              : "proposal_rejected",
          userId: payload.recipientUserId,
        })
      ),
    listNotifications: (input) => {
      capturedCalls.listNotifications = input;

      return Promise.resolve([notificationFixture({ userId: input.userId })]);
    },
    markAllAsRead: (userId) => {
      capturedCalls.markAllAsRead = userId;

      return Promise.resolve({ updated: 2 });
    },
    markAsRead: (notificationId, userId) => {
      capturedCalls.markAsRead = { notificationId, userId };

      return Promise.resolve(
        notificationFixture({
          id: notificationId,
          read: true,
          readAt: now,
          userId,
        })
      );
    },
  } satisfies NotificationService;

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
    .use(createNotificationRoutes(createTestAuth(), notificationService));
};

describe("notification routes", () => {
  beforeEach(() => {
    currentSession = {
      user: {
        id: "usr_actor",
        role: "mahasiswa",
      },
    };
  });

  test("requires authentication", async () => {
    currentSession = null;
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/notifications")
    );
    const body = await response.json<ErrorResponseBody>();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("lists notifications for the authenticated user", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request(
        "http://localhost/notifications?userId=usr_spoofed&read=false"
      )
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.listNotifications).toEqual({
      read: false,
      userId: "usr_actor",
    });
  });

  test("marks a notification read for the authenticated user", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/notifications/ntf_1/read", {
        body: JSON.stringify({
          userId: "usr_spoofed",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.markAsRead).toEqual({
      notificationId: "ntf_1",
      userId: "usr_actor",
    });
  });

  test("marks all notifications read for the authenticated user", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/notifications/read-all", {
        body: JSON.stringify({
          userId: "usr_spoofed",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.markAllAsRead).toBe("usr_actor");
  });
});
