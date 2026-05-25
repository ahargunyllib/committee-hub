import type { User } from "../../db/auth.schema";
import type {
  ActivityLogEntry,
  AdminRepository,
  UpdateUserRoleInput,
  UpsertSystemConfigInput,
} from "./admin.repository";
import type { SystemConfig } from "./admin.schema";

export type AdminService = {
  listUsers: () => Promise<User[]>;
  updateUserRole: (userId: string, input: UpdateUserRoleInput) => Promise<User>;
  listSystemConfigs: () => Promise<SystemConfig[]>;
  upsertSystemConfig: (input: UpsertSystemConfigInput) => Promise<SystemConfig>;
  listActivity: () => Promise<ActivityLogEntry[]>;
};

type CreateAdminServiceContext = {
  repository: AdminRepository;
};

export const createAdminService = ({
  repository,
}: CreateAdminServiceContext): AdminService => ({
  listUsers: () => repository.listUsers(),
  // prevent demoting the last admin when that invariant is introduced
  // update only the role field
  updateUserRole: (userId, input) => repository.updateUserRole(userId, input),
  listSystemConfigs: () => repository.listSystemConfigs(),
  // parse value according to valueType before persisting
  // keep system config as the single source of truth
  upsertSystemConfig: (input) => repository.upsertSystemConfig(input),
  listActivity: () => repository.listActivity(),
});
