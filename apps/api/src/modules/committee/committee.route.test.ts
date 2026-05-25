import { beforeEach, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import type { AuthSession, SessionAuth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import type {
  CreateCommitteeApplicationInput,
  CreateDivisionInput,
  ReviewCommitteeApplicationInput,
  UpdateDivisionInput,
} from "./committee.repository";
import type { CommitteeService } from "./committee.service";
import type { CommitteeApplication, Division } from "./committee.schema";

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

const { createCommitteeRoutes } = await import("./committee.route");

const now = new Date("2026-01-01T00:00:00.000Z");

const divisionFixture = (override: Partial<Division> = {}): Division => ({
  createdAt: now,
  description: "Owns event rundown",
  eventId: "evt_1",
  id: "div_1",
  name: "Acara",
  quota: 10,
  updatedAt: now,
  ...override,
});

const applicationFixture = (
  override: Partial<CommitteeApplication> = {}
): CommitteeApplication => ({
  createdAt: now,
  divisionId: "div_1",
  id: "app_1",
  motivation: "I want to contribute.",
  reviewedAt: null,
  reviewedById: null,
  status: "pending",
  updatedAt: now,
  userId: "usr_actor",
  ...override,
});

type CapturedCalls = {
  createApplication?: CreateCommitteeApplicationInput;
  reviewApplication?: {
    applicationId: string;
    input: ReviewCommitteeApplicationInput;
  };
};

const createTestApp = (capturedCalls: CapturedCalls) => {
  const committeeService = {
    createApplication: (input) => {
      capturedCalls.createApplication = input;
      return Promise.resolve(applicationFixture({ userId: input.userId }));
    },
    createDivision: (input: CreateDivisionInput) =>
      Promise.resolve(divisionFixture(input)),
    listApplicationsByDivision: (divisionId) =>
      Promise.resolve([applicationFixture({ divisionId })]),
    listDivisionsByEvent: (eventId) =>
      Promise.resolve([divisionFixture({ eventId })]),
    reviewApplication: (applicationId, input) => {
      capturedCalls.reviewApplication = { applicationId, input };
      return Promise.resolve(
        applicationFixture({
          id: applicationId,
          reviewedById: input.reviewerId,
          status: input.status,
        })
      );
    },
    updateDivision: (divisionId, input: UpdateDivisionInput) =>
      Promise.resolve(divisionFixture({ id: divisionId, ...input })),
  } satisfies CommitteeService;

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
    .use(createCommitteeRoutes(createTestAuth(), committeeService));
};

describe("committee routes", () => {
  beforeEach(() => {
    currentSession = {
      user: {
        id: "usr_actor",
        role: "mahasiswa",
      },
    };
  });

  test("requires authentication when applying to a division", async () => {
    currentSession = null;
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/committee/divisions/div_1/applications", {
        body: JSON.stringify({
          motivation: "I want to contribute.",
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

  test("uses authenticated actor as committee applicant", async () => {
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/committee/divisions/div_1/applications", {
        body: JSON.stringify({
          motivation: "I want to contribute.",
          userId: "usr_spoofed",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.createApplication).toEqual({
      divisionId: "div_1",
      motivation: "I want to contribute.",
      userId: "usr_actor",
    });
  });

  test("uses authenticated actor as application reviewer", async () => {
    currentSession = {
      user: {
        id: "usr_reviewer",
        role: "ketua_panitia",
      },
    };
    const capturedCalls: CapturedCalls = {};
    const app = createTestApp(capturedCalls);

    const response = await app.handle(
      new Request("http://localhost/committee/applications/app_1/review", {
        body: JSON.stringify({
          reviewerId: "usr_spoofed",
          status: "accepted",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      })
    );

    expect(response.status).toBe(200);
    expect(capturedCalls.reviewApplication).toEqual({
      applicationId: "app_1",
      input: {
        reviewerId: "usr_reviewer",
        status: "accepted",
      },
    });
  });
});
