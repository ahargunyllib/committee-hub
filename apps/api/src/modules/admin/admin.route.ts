import { Elysia, t } from "elysia";
import { auth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import type { AdminService } from "./admin.service";

const userRole = t.Union([
  t.Literal("mahasiswa"),
  t.Literal("ketua_panitia"),
  t.Literal("ormawa"),
  t.Literal("fakultas"),
  t.Literal("universitas"),
  t.Literal("admin"),
]);

const configValueType = t.Union([
  t.Literal("string"),
  t.Literal("number"),
  t.Literal("boolean"),
  t.Literal("json"),
]);

const requireAdminSession = async (headers: Headers): Promise<string> => {
  const authSession = await auth.api.getSession({
    headers,
  });

  if (!authSession) {
    throw new AppError("UNAUTHORIZED", "Authentication is required");
  }

  if (authSession.user.role !== "admin") {
    throw new AppError("FORBIDDEN", "Admin role is required");
  }

  return authSession.user.id;
};

export const createAdminRoutes = (adminService: AdminService) =>
  new Elysia({
    name: "admin-routes",
    prefix: "/admin",
  })
    .derive(async ({ request }) => ({
      adminActorUserId: await requireAdminSession(request.headers),
    }))
    .get("/users", () => adminService.listUsers(), {
      detail: {
        summary: "List users",
        tags: ["Admin"],
      },
    })
    .patch(
      "/users/:userId/role",
      ({ adminActorUserId, body, params }) =>
        adminService.updateUserRole(params.userId, {
          actorUserId: adminActorUserId,
          role: body.role,
        }),
      {
        params: t.Object({
          userId: t.String(),
        }),
        body: t.Object({
          role: userRole,
        }),
        detail: {
          summary: "Update a user's role",
          tags: ["Admin"],
        },
      }
    )
    .get("/config", () => adminService.listSystemConfigs(), {
      detail: {
        summary: "List system configuration",
        tags: ["Admin"],
      },
    })
    .put(
      "/config/:key",
      ({ adminActorUserId, body, params }) =>
        adminService.upsertSystemConfig({
          ...body,
          actorUserId: adminActorUserId,
          key: params.key,
        }),
      {
        params: t.Object({
          key: t.String(),
        }),
        body: t.Object({
          description: t.Optional(t.String()),
          value: t.String(),
          valueType: configValueType,
        }),
        detail: {
          summary: "Create or update system configuration",
          tags: ["Admin"],
        },
      }
    )
    .get("/activity", () => adminService.listActivity(), {
      detail: {
        summary: "List system activity",
        tags: ["Admin"],
      },
    });
