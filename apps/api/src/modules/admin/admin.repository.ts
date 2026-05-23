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
  listUsers: () => notImplemented("admin.repository.listUsers"),
  updateUserRole: (_userId, _input) =>
    notImplemented("admin.repository.updateUserRole"),
  listSystemConfigs: () => notImplemented("admin.repository.listSystemConfigs"),
  upsertSystemConfig: (_input) =>
    notImplemented("admin.repository.upsertSystemConfig"),
  listActivity: () => notImplemented("admin.repository.listActivity"),
});
