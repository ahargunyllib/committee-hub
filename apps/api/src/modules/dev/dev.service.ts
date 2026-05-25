import type { User, UserRole } from "../../db/auth.schema";
import type { DevRepository } from "./dev.repository";

export type UpdateCurrentUserRoleInput = {
  role: UserRole;
  userId: string;
};

export type DevService = {
  updateCurrentUserRole: (input: UpdateCurrentUserRoleInput) => Promise<User>;
};

type CreateDevServiceContext = {
  repository: DevRepository;
};

export const createDevService = ({
  repository,
}: CreateDevServiceContext): DevService => ({
  updateCurrentUserRole: (input) =>
    repository.updateCurrentUserRole(input.userId, input.role),
});
