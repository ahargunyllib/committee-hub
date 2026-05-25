import { beforeEach, describe, expect, mock, test } from "bun:test";
import { Elysia } from "elysia";
import type { User } from "../../db/auth.schema";
import { AppError } from "../../lib/errors";
import type {
  ActivityLogEntry,
  UpdateUserRoleInput,
  UpsertSystemConfigInput,
} from "./admin.repository";
import type { AdminService } from "./admin.service";
import type { SystemConfig } from "./admin.schema";

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

const { createAdminRoutes } = await import("./admin.route");

const now = new Date("2026-01-01T00:00:00.000Z");

const userFixture = (override: Partial<User> = {}): User => ({
  createdAt: now,
  email: "admin@example.com",
  emailVerified: true,
  id: "usr_admin",
  image: null,
  name: "Admin User",
  role: "admin",
  updatedAt: now,
  ...override,
});

const systemConfigFixture = (
  override: Partial<SystemConfig> = {}
): SystemConfig => ({
  createdAt: now,
  description: "Default proposal review SLA",
  id: "cfg_1",
  key: "proposal.review_sla_days",
  updatedAt: now,
  updatedById: "usr_admin",
  value: "7",
  valueType: "number",
  ...override,
});

const activityFixture = (
  override: Partial<ActivityLogEntry> = {}
): ActivityLogEntry => ({
  action: "admin.user_role_updated",
  actorUserId: "usr_admin",
  createdAt: now,
  id: "act_1",
  metadata: JSON.stringify({ role: "ormawa" }),
  target: "user:usr_target",
  targetId: "usr_target",
  targetType: "user",
  userId: "usr_admin",
  userName: "Admin User",
  verb: "updated user role",
  ...override,
});

type CapturedCalls = {
  updateUserRole?: {
    input: UpdateUserRoleInput;
    userId: string;
  };
  upsertSystemConfig?: UpsertSystemConfigInput;
};

const createTestApp = (capturedCalls: CapturedCalls) => {
  const adminService = {
    listActivity: () => Promise.resolve([activityFixture()]),
    listSystemConfigs: () => Promise.resolve([systemConfigFixture()]),
    listUsers: () => Promise.resolve([userFixture()]),
    updateUserRole: (userId, input) => {
      capturedCalls.updateUserRole = { input, userId };

      return Promise.resolve(userFixture({ id: userId, role: input.role }));
    },
    upsertSystemConfig: (input) => {
      capturedCalls.upsertSystemConfig = input;

      return Promise.resolve(
        systemConfigFixture({
          description: input.description ?? null,
          key: input.key,
          updatedById: input.actorUserId,
          value: input.value,
          valueType: input.valueType,
        })
      );
    },
  } satisfies AdminService;

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
    .use(createAdminRoutes(adminService));
};

describe("admin routes", () => {
  beforeEach(() => {
    currentSession = {
      user: {
        id: "usr_admin",
        role: "admin",
      },
    };
  });

  test("requires authentication", async () => {
    currentSession = null;
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/admin/users")
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("requires admin role", async () => {
    currentSession = {
      user: {
        id: "usr_member",
        role: "mahasiswa",
      },
    };
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/admin/users")
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  test("lists users for admin session", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/admin/users")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body[0].id).toBe("usr_admin");
  });

  test("uses authenticated admin actor when updating user role", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/admin/users/usr_target/role", {
        body: JSON.stringify({
          actorUserId: "usr_spoofed",
          role: "ormawa",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.updateUserRole).toEqual({
      input: {
        actorUserId: "usr_admin",
        role: "ormawa",
      },
      userId: "usr_target",
    });
  });

  test("uses authenticated admin actor when upserting system config", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/admin/config/proposal.review_sla_days", {
        body: JSON.stringify({
          actorUserId: "usr_spoofed",
          description: "Review SLA in days",
          value: "7",
          valueType: "number",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PUT",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.upsertSystemConfig).toEqual({
      actorUserId: "usr_admin",
      description: "Review SLA in days",
      key: "proposal.review_sla_days",
      value: "7",
      valueType: "number",
    });
  });

  test("lists admin activity for admin session", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/admin/activity")
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body[0].action).toBe("admin.user_role_updated");
  });
});
