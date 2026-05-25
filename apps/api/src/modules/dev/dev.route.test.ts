import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Elysia } from "elysia";
import type { User } from "../../db/auth.schema";
import { AppError } from "../../lib/errors";
import type { UpdateCurrentUserRoleInput } from "./dev.service";
import type { DevService } from "./dev.service";

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

mock.module("../../lib/logger", () => ({
  logger: {
    warn: () => undefined,
  },
}));

const { createDevRoutes } = await import("./dev.route");

const now = new Date("2026-01-01T00:00:00.000Z");

const userFixture = (override: Partial<User> = {}): User => ({
  createdAt: now,
  email: "student@example.com",
  emailVerified: true,
  id: "usr_student",
  image: null,
  name: "Student User",
  role: "mahasiswa",
  updatedAt: now,
  ...override,
});

type CapturedCalls = {
  updateCurrentUserRole?: UpdateCurrentUserRoleInput;
};

const createTestApp = (capturedCalls: CapturedCalls) => {
  const devService = {
    updateCurrentUserRole: (input) => {
      capturedCalls.updateCurrentUserRole = input;

      return Promise.resolve(
        userFixture({ id: input.userId, role: input.role })
      );
    },
  } satisfies DevService;

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
    .use(createDevRoutes(devService));
};

describe("dev routes", () => {
  beforeEach(() => {
    currentSession = {
      user: {
        id: "usr_student",
        role: "mahasiswa",
      },
    };
  });

  test("requires authentication", async () => {
    currentSession = null;
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/dev/session/role", {
        body: JSON.stringify({ role: "admin" }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("updates the authenticated user's role", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/dev/session/role", {
        body: JSON.stringify({
          role: "admin",
          userId: "usr_spoofed",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.role).toBe("admin");
    expect(capturedCalls.updateCurrentUserRole).toEqual({
      role: "admin",
      userId: "usr_student",
    });
  });
});
