import type { DB } from "../../db";
import { userTable, type User, type UserRole } from "../../db/auth.schema";
import { AppError } from "../../lib/errors";
import { desc, eq } from "drizzle-orm";
import type { AdminActivityLog, SystemConfig } from "./admin.schema";
import { adminActivityLogTable, systemConfigTable } from "./admin.schema";

export type UpdateUserRoleInput = {
  actorUserId: string;
  role: UserRole;
};

export type UpsertSystemConfigInput = {
  actorUserId: string;
  description?: string;
  key: string;
  value: string;
  valueType: SystemConfig["valueType"];
};

export type ActivityLogEntry = AdminActivityLog;

export type AdminRepository = {
  listUsers: () => Promise<User[]>;
  updateUserRole: (userId: string, input: UpdateUserRoleInput) => Promise<User>;
  listSystemConfigs: () => Promise<SystemConfig[]>;
  upsertSystemConfig: (input: UpsertSystemConfigInput) => Promise<SystemConfig>;
  listActivity: () => Promise<ActivityLogEntry[]>;
};

const firstOrNotFound = <T>(rows: T[], message: string): T => {
  const [row] = rows;

  if (!row) {
    throw new AppError("NOT_FOUND", message);
  }

  return row;
};

export const createAdminRepository = (db: DB): AdminRepository => ({
  // Read Better Auth users for admin management; userTable is shared auth infrastructure, not a business service.
  listUsers: () => db.select().from(userTable).orderBy(userTable.createdAt),
  // Update only the role field after service-level authorization decides the actor can manage roles.
  updateUserRole: async (userId, input) => {
    const rows = await db.transaction(async (tx) => {
      const updatedRows = await tx
        .update(userTable)
        .set({ role: input.role })
        .where(eq(userTable.id, userId))
        .returning();

      const updatedUser = firstOrNotFound(updatedRows, "User not found");

      await tx.insert(adminActivityLogTable).values({
        action: "admin.user_role_updated",
        actorUserId: input.actorUserId,
        metadata: JSON.stringify({ role: input.role }),
        targetId: userId,
        targetType: "user",
      });

      return updatedUser;
    });

    return rows;
  },
  // Read key/value platform settings from system_config.
  listSystemConfigs: () =>
    db.select().from(systemConfigTable).orderBy(systemConfigTable.key),
  // Upsert one config key and stamp the updater when provided.
  upsertSystemConfig: async (input) => {
    const rows = await db.transaction(async (tx) => {
      const savedRows = await tx
        .insert(systemConfigTable)
        .values({
          description: input.description,
          key: input.key,
          updatedById: input.actorUserId,
          value: input.value,
          valueType: input.valueType,
        })
        .onConflictDoUpdate({
          set: {
            description: input.description,
            updatedById: input.actorUserId,
            value: input.value,
            valueType: input.valueType,
          },
          target: systemConfigTable.key,
        })
        .returning();

      const savedConfig = firstOrNotFound(
        savedRows,
        "System config was not saved"
      );

      await tx.insert(adminActivityLogTable).values({
        action: "admin.system_config_upserted",
        actorUserId: input.actorUserId,
        metadata: JSON.stringify({
          valueType: input.valueType,
        }),
        targetId: input.key,
        targetType: "system_config",
      });

      return savedConfig;
    });

    return rows;
  },
  // Return the newest admin actions first for activity monitoring.
  listActivity: () =>
    db
      .select()
      .from(adminActivityLogTable)
      .orderBy(desc(adminActivityLogTable.createdAt)),
});
