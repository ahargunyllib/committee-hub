import { cors } from "@elysia/cors";
import { openapi } from "@elysia/openapi";
import type { ElysiaOpenAPIConfig } from "@elysia/openapi";
import { Elysia } from "elysia";
import { env } from "./env";
import { auth } from "./lib/auth";
import { getAuthOpenAPIDocumentation } from "./lib/auth-openapi";
import { adminRoutes } from "./modules/admin/admin.route";
import { committeeRoutes } from "./modules/committee/committee.route";
import { eventRoutes } from "./modules/event/event.route";
import { notificationRoutes } from "./modules/notification/notification.route";
import { proposalRoutes } from "./modules/proposal/proposal.route";
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
  .use(committeeRoutes)
  .use(proposalRoutes)
  .use(eventRoutes)
  .use(notificationRoutes)
  .use(adminRoutes);

export type App = typeof app;
