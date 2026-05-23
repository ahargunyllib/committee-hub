import type { DB } from "../../db";
import { notImplemented } from "../../lib/stub";
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

export const createNotificationRepository = (
  _db: DB
): NotificationRepository => ({
  // Query a user's notification feed, newest first, optionally filtered by read state.
  listNotifications: (_input) =>
    notImplemented("notification.repository.listNotifications"),
  // Persist one in-app notification from an internal domain event.
  createNotification: (_input) =>
    notImplemented("notification.repository.createNotification"),
  // Mark one notification read only when it belongs to the requesting user.
  markAsRead: (_notificationId, _userId) =>
    notImplemented("notification.repository.markAsRead"),
  // Bulk-mark unread notifications for one user and return the affected count.
  markAllAsRead: (_userId) =>
    notImplemented("notification.repository.markAllAsRead"),
});
