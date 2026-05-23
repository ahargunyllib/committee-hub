import type { DB } from "../../db";
import { notImplemented } from "../../lib/stub";
import type { User, UserRole } from "../../db/auth.schema";
import type { SystemConfig } from "./admin.schema";

export type UpdateUserRoleInput = {
  role: UserRole;
};

export type UpsertSystemConfigInput = {
  description?: string;
  key: string;
  updatedById?: string;
  value: string;
  valueType: SystemConfig["valueType"];
};

export type ActivityLogEntry = {
  action: string;
  actorUserId?: string;
  createdAt: string;
  id: string;
  targetId?: string;
  targetType?: string;
};

export type AdminRepository = {
  listUsers: () => Promise<User[]>;
  updateUserRole: (userId: string, input: UpdateUserRoleInput) => Promise<User>;
  listSystemConfigs: () => Promise<SystemConfig[]>;
  upsertSystemConfig: (input: UpsertSystemConfigInput) => Promise<SystemConfig>;
  listActivity: () => Promise<ActivityLogEntry[]>;
};

export const createAdminRepository = (_db: DB): AdminRepository => ({
  // Read Better Auth users for admin management; userTable is shared auth infrastructure, not a business service.
  listUsers: () => notImplemented("admin.repository.listUsers"),
  // Update only the role field after service-level authorization decides the actor can manage roles.
  updateUserRole: (_userId, _input) =>
    notImplemented("admin.repository.updateUserRole"),
  // Read key/value platform settings from system_config.
  listSystemConfigs: () => notImplemented("admin.repository.listSystemConfigs"),
  // Upsert one config key and stamp the updater when provided.
  upsertSystemConfig: (_input) =>
    notImplemented("admin.repository.upsertSystemConfig"),
  // Placeholder until an activity/audit table is introduced.
  listActivity: () => notImplemented("admin.repository.listActivity"),
});
