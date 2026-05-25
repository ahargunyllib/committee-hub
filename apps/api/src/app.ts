import cors from "@elysia/cors";
import { openapi, type ElysiaOpenAPIConfig } from "@elysia/openapi";
import { env } from "cloudflare:workers";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { createDb } from "./db";
import { createAuth, type Auth } from "./lib/auth";
import {
  getAuthOpenAPIDocumentation,
  type AuthOpenAPIDocumentation,
} from "./lib/auth-openapi";
import { createAuthContextPlugin } from "./middleware/auth-context";
import { errorHandlerPlugin } from "./middleware/error-handler";
import { requestContextPlugin } from "./middleware/request-context";
import { createAdminRepository } from "./modules/admin/admin.repository";
import { createAdminRoutes } from "./modules/admin/admin.route";
import {
  createAdminService,
  type AdminService,
} from "./modules/admin/admin.service";
import { createCommitteeRepository } from "./modules/committee/committee.repository";
import { createCommitteeRoutes } from "./modules/committee/committee.route";
import {
  createCommitteeService,
  type CommitteeService,
} from "./modules/committee/committee.service";
import { createDevRepository } from "./modules/dev/dev.repository";
import { createDevRoutes } from "./modules/dev/dev.route";
import { createDevService, type DevService } from "./modules/dev/dev.service";
import { createEventRepository } from "./modules/event/event.repository";
import { createEventRoutes } from "./modules/event/event.route";
import {
  createEventService,
  type EventService,
} from "./modules/event/event.service";
import { createNotificationRepository } from "./modules/notification/notification.repository";
import { createNotificationRoutes } from "./modules/notification/notification.route";
import {
  createNotificationService,
  registerNotificationListeners,
  type NotificationService,
} from "./modules/notification/notification.service";
import { createProposalRepository } from "./modules/proposal/proposal.repository";
import { createProposalRoutes } from "./modules/proposal/proposal.route";
import {
  createProposalService,
  type ProposalService,
} from "./modules/proposal/proposal.service";

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const isAllowedOrigin = (request: Request): boolean => {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  return origin === env.DASHBOARD_URL || localOriginPattern.test(origin);
};

type OpenAPIDocumentation = NonNullable<ElysiaOpenAPIConfig["documentation"]>;

export const createApp = (
  auth: Auth,
  committeeService: CommitteeService,
  proposalService: ProposalService,
  eventService: EventService,
  notificationService: NotificationService,
  adminService: AdminService,
  devService: DevService,
  authOpenAPIDocumentation: AuthOpenAPIDocumentation
) =>
  new Elysia({
    adapter: CloudflareAdapter,
  })
    .use(errorHandlerPlugin)
    .use(requestContextPlugin)
    .use(createAuthContextPlugin(auth))
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
            { name: "Dev" },
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
    .use(createCommitteeRoutes(auth, committeeService))
    .use(createProposalRoutes(auth, proposalService))
    .use(createEventRoutes(auth, eventService))
    .use(createNotificationRoutes(auth, notificationService))
    .use(createDevRoutes(auth, devService))
    .use(createAdminRoutes(auth, adminService))
    .compile();

export type App = ReturnType<typeof createApp>;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const db = createDb(env.HYPERDRIVE.connectionString);

    const auth = createAuth(db, (promise) => ctx.waitUntil(promise));

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
    const devService = createDevService({
      repository: createDevRepository(db),
    });

    const authOpenAPIDocumentation = await getAuthOpenAPIDocumentation(auth);

    registerNotificationListeners(notificationService);

    const app = createApp(
      auth,
      committeeService,
      proposalService,
      eventService,
      notificationService,
      adminService,
      devService,
      authOpenAPIDocumentation
    );

    return await app.fetch(request);
  },
};
