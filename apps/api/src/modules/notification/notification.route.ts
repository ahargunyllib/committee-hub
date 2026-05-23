import { Elysia, t } from "elysia";
import type { NotificationService } from "./notification.service";

export const createNotificationRoutes = (
  notificationService: NotificationService
) =>
  new Elysia({
    name: "notification-routes",
    prefix: "/notifications",
  })
    .get("/", ({ query }) => notificationService.listNotifications(query), {
      query: t.Object({
        read: t.Optional(t.Boolean()),
        userId: t.String(),
      }),
      detail: {
        summary: "List notifications for a user",
        tags: ["Notification"],
      },
    })
    .patch(
      "/:notificationId/read",
      ({ body, params }) =>
        notificationService.markAsRead(params.notificationId, body.userId),
      {
        params: t.Object({
          notificationId: t.String(),
        }),
        body: t.Object({
          userId: t.String(),
        }),
        detail: {
          summary: "Mark a notification as read",
          tags: ["Notification"],
        },
      }
    )
    .patch(
      "/read-all",
      ({ body }) => notificationService.markAllAsRead(body.userId),
      {
        body: t.Object({
          userId: t.String(),
        }),
        detail: {
          summary: "Mark all notifications as read",
          tags: ["Notification"],
        },
      }
    );
