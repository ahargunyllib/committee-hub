import { Elysia, t } from "elysia";
import { db } from "../../db";
import { createAdminRepository } from "./admin.repository";
import { createAdminService } from "./admin.service";

const adminService = createAdminService({
  repository: createAdminRepository(db),
});

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

export const adminRoutes = new Elysia({
  name: "admin-routes",
  prefix: "/admin",
})
  .get("/users", () => adminService.listUsers(), {
    detail: {
      summary: "List users",
      tags: ["Admin"],
    },
  })
  .patch(
    "/users/:userId/role",
    ({ body, params }) => adminService.updateUserRole(params.userId, body),
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
    ({ body, params }) =>
      adminService.upsertSystemConfig({
        ...body,
        key: params.key,
      }),
    {
      params: t.Object({
        key: t.String(),
      }),
      body: t.Object({
        description: t.Optional(t.String()),
        updatedById: t.Optional(t.String()),
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
