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
  listNotifications: (_input) =>
    notImplemented("notification.repository.listNotifications"),
  createNotification: (_input) =>
    notImplemented("notification.repository.createNotification"),
  markAsRead: (_notificationId, _userId) =>
    notImplemented("notification.repository.markAsRead"),
  markAllAsRead: (_userId) =>
    notImplemented("notification.repository.markAllAsRead"),
});
