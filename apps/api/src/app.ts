import { cors } from "@elysia/cors";
import { openapi } from "@elysia/openapi";
import type { ElysiaOpenAPIConfig } from "@elysia/openapi";
import { Elysia } from "elysia";
import { db } from "./db";
import { env } from "./env";
import { auth } from "./lib/auth";
import { getAuthOpenAPIDocumentation } from "./lib/auth-openapi";
import { createAdminRepository } from "./modules/admin/admin.repository";
import { createAdminRoutes } from "./modules/admin/admin.route";
import { createAdminService } from "./modules/admin/admin.service";
import { createCommitteeRepository } from "./modules/committee/committee.repository";
import { createCommitteeRoutes } from "./modules/committee/committee.route";
import { createCommitteeService } from "./modules/committee/committee.service";
import { createEventRepository } from "./modules/event/event.repository";
import { createEventRoutes } from "./modules/event/event.route";
import { createEventService } from "./modules/event/event.service";
import { createNotificationRepository } from "./modules/notification/notification.repository";
import { createNotificationRoutes } from "./modules/notification/notification.route";
import {
  createNotificationService,
  registerNotificationListeners,
} from "./modules/notification/notification.service";
import { createProposalRepository } from "./modules/proposal/proposal.repository";
import { createProposalRoutes } from "./modules/proposal/proposal.route";
import { createProposalService } from "./modules/proposal/proposal.service";
import { authContextPlugin } from "./middleware/auth-context";
import { errorHandlerPlugin } from "./middleware/error-handler";
import { requestContextPlugin } from "./middleware/request-context";

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const isAllowedOrigin = (request: Request): boolean => {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  return origin === env.DASHBOARD_URL || localOriginPattern.test(origin);
};

const authOpenAPIDocumentation = await getAuthOpenAPIDocumentation();
type OpenAPIDocumentation = NonNullable<ElysiaOpenAPIConfig["documentation"]>;

const committeeService = createCommitteeService({
  repository: createCommitteeRepository(db),
});
const proposalService = createProposalService({
  repository: createProposalRepository(db),
});
const eventService = createEventService({
  repository: createEventRepository(db),
});
const notificationService = createNotificationService({
  repository: createNotificationRepository(db),
});
const adminService = createAdminService({
  repository: createAdminRepository(db),
});

registerNotificationListeners(notificationService);

export const app = new Elysia()
  .use(errorHandlerPlugin)
  .use(requestContextPlugin)
  .use(authContextPlugin)
  .use(
    cors({
      allowedHeaders: ["Authorization", "Content-Type", "Cookie"],
      credentials: true,
      exposeHeaders: ["x-request-id"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      origin: isAllowedOrigin,
    })
  )
  .use(
    openapi({
      documentation: {
        components:
          authOpenAPIDocumentation.components as unknown as OpenAPIDocumentation["components"],
        info: {
          description:
            "Campus event and committee management API for committee-hub.",
          title: "committee-hub API",
          version: "0.1.0",
        },
        tags: [
          { name: "Better Auth" },
          { name: "Committee" },
          { name: "Proposal" },
          { name: "Event" },
          { name: "Notification" },
          { name: "Admin" },
        ],
        paths:
          authOpenAPIDocumentation.paths as unknown as OpenAPIDocumentation["paths"],
      },
      path: "/swagger",
      provider: "swagger-ui",
      specPath: "/swagger/json",
    })
  )
  .get(
    "/",
    () => ({
      message: "Welcome to the committee-hub API",
      service: "committee-hub-api",
    }),
    {
      detail: {
        summary: "API root",
        tags: ["Health"],
      },
    }
  )
  .get(
    "/health",
    () => ({
      ok: true,
      uptime: process.uptime(),
    }),
    {
      detail: {
        summary: "Health check",
        tags: ["Health"],
      },
    }
  )
  .mount(auth.handler)
  .use(createCommitteeRoutes(committeeService))
  .use(createProposalRoutes(proposalService))
  .use(createEventRoutes(eventService))
  .use(createNotificationRoutes(notificationService))
  .use(createAdminRoutes(adminService));

export type App = typeof app;
