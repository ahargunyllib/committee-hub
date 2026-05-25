import type { User } from "../../db/auth.schema";
import { AppError } from "../../lib/errors";
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

const configValueParsers = {
  boolean: (value: string) => {
    if (value !== "true" && value !== "false") {
      throw new AppError(
        "BAD_REQUEST",
        "Boolean system config values must be 'true' or 'false'"
      );
    }
  },
  json: (value: string) => {
    try {
      JSON.parse(value);
    } catch (error) {
      throw new AppError("BAD_REQUEST", "JSON system config value is invalid", {
        cause: error instanceof Error ? error : undefined,
      });
    }
  },
  number: (value: string) => {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      throw new AppError(
        "BAD_REQUEST",
        "Number system config value must be finite"
      );
    }
  },
  string: (value: string) => {
    if (value.length === 0) {
      throw new AppError(
        "BAD_REQUEST",
        "String system config value is required"
      );
    }
  },
} as const satisfies Record<SystemConfig["valueType"], (value: string) => void>;

const assertValidSystemConfigInput = (input: UpsertSystemConfigInput): void => {
  if (input.key.trim().length === 0) {
    throw new AppError("BAD_REQUEST", "System config key is required");
  }

  configValueParsers[input.valueType](input.value);
};

export const createAdminService = ({
  repository,
}: CreateAdminServiceContext): AdminService => ({
  listUsers: () => repository.listUsers(),
  updateUserRole: async (userId, input) => {
    const targetUser = await repository.getUserById(userId);

    if (!targetUser) {
      throw new AppError("NOT_FOUND", "User not found");
    }

    if (targetUser.role === "admin" && input.role !== "admin") {
      const adminCount = await repository.countAdmins();

      if (adminCount <= 1) {
        throw new AppError("CONFLICT", "Cannot demote the last admin user");
      }
    }

    return repository.updateUserRole(userId, input);
  },
  listSystemConfigs: () => repository.listSystemConfigs(),
  upsertSystemConfig: (input) => {
    assertValidSystemConfigInput(input);

    return repository.upsertSystemConfig({
      ...input,
      key: input.key.trim(),
    });
  },
  listActivity: () => repository.listActivity(),
});
