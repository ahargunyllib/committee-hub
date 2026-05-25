import { eq } from "drizzle-orm";
import type { DB } from "../../db";
import { userTable, type User, type UserRole } from "../../db/auth.schema";
import { AppError } from "../../lib/errors";

export type DevRepository = {
  updateCurrentUserRole: (userId: string, role: UserRole) => Promise<User>;
};

const firstOrNotFound = <T>(rows: T[], message: string): T => {
  const [row] = rows;

  if (!row) {
    throw new AppError("NOT_FOUND", message);
  }

  return row;
};

export const createDevRepository = (db: DB): DevRepository => ({
  updateCurrentUserRole: async (userId, role) => {
    const rows = await db
      .update(userTable)
      .set({ role })
      .where(eq(userTable.id, userId))
      .returning();

    return firstOrNotFound(rows, "User not found");
  },
});
