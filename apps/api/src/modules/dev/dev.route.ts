import { Elysia, t } from "elysia";
import { auth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import { logger } from "../../lib/logger";
import type { DevService } from "./dev.service";

const userRole = t.Union([
  t.Literal("mahasiswa"),
  t.Literal("ketua_panitia"),
  t.Literal("ormawa"),
  t.Literal("fakultas"),
  t.Literal("universitas"),
  t.Literal("admin"),
]);

const isDevRoleEndpointEnabled = true;

const requireDevSession = async (headers: Headers): Promise<string> => {
  if (!isDevRoleEndpointEnabled) {
    throw new AppError("NOT_FOUND", "Development role endpoint is not enabled");
  }

  const authSession = await auth.api.getSession({
    headers,
  });

  if (!authSession) {
    throw new AppError("UNAUTHORIZED", "Authentication is required");
  }

  return authSession.user.id;
};

export const createDevRoutes = (devService: DevService) =>
  new Elysia({
    name: "dev-routes",
    prefix: "/dev",
  })
    .derive(async ({ request }) => ({
      devActorUserId: await requireDevSession(request.headers),
    }))
    .patch(
      "/session/role",
      async ({ body, devActorUserId }) => {
        // TODO: Remove this temporary dev endpoint once role testing no longer
        // needs direct DB role switching from a non-admin account.
        const user = await devService.updateCurrentUserRole({
          role: body.role,
          userId: devActorUserId,
        });

        logger.warn(
          {
            actorUserId: devActorUserId,
            role: body.role,
          },
          "Development role endpoint updated current user role"
        );

        return user;
      },
      {
        body: t.Object({
          role: userRole,
        }),
        detail: {
          summary: "Update current session user's role for development",
          tags: ["Dev"],
        },
      }
    );
