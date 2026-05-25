import { and, desc, eq } from "drizzle-orm";
import type { DB } from "../../db";
import { AppError } from "../../lib/errors";
import { notificationTable } from "./notification.schema";
import type { Notification, NotificationType } from "./notification.schema";

export type ListNotificationsInput = {
  read?: boolean;
  userId: string;
};

export type CreateNotificationInput = {
  message: string;
  referenceId?: string;
  referenceType?: string;
  type: NotificationType;
  userId: string;
};

export type NotificationRepository = {
  listNotifications: (input: ListNotificationsInput) => Promise<Notification[]>;
  createNotification: (input: CreateNotificationInput) => Promise<Notification>;
  markAsRead: (notificationId: string, userId: string) => Promise<Notification>;
  markAllAsRead: (userId: string) => Promise<{ updated: number }>;
};

const firstOrNotFound = <T>(rows: T[], message: string): T => {
  const [row] = rows;

  if (!row) {
    throw new AppError("NOT_FOUND", message);
  }

  return row;
};

export const createNotificationRepository = (
  db: DB
): NotificationRepository => ({
  // Query a user's notification feed, newest first, optionally filtered by read state.
  listNotifications: (input) => {
    const filters = [
      eq(notificationTable.userId, input.userId),
      input.read === undefined
        ? undefined
        : eq(notificationTable.read, input.read),
    ].filter((filter) => filter !== undefined);

    return db
      .select()
      .from(notificationTable)
      .where(and(...filters))
      .orderBy(desc(notificationTable.createdAt));
  },
  // Persist one in-app notification from an internal domain event.
  createNotification: async (input) => {
    const rows = await db.insert(notificationTable).values(input).returning();

    return firstOrNotFound(rows, "Notification was not created");
  },
  // Mark one notification read only when it belongs to the requesting user.
  markAsRead: async (notificationId, userId) => {
    const rows = await db
      .update(notificationTable)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationTable.id, notificationId),
          eq(notificationTable.userId, userId)
        )
      )
      .returning();

    return firstOrNotFound(rows, "Notification not found");
  },
  // Bulk-mark unread notifications for one user and return the affected count.
  markAllAsRead: async (userId) => {
    const rows = await db
      .update(notificationTable)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationTable.userId, userId),
          eq(notificationTable.read, false)
        )
      )
      .returning({ id: notificationTable.id });

    return { updated: rows.length };
  },
});
