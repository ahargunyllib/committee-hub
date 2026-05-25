import { Elysia, t } from "elysia";
import { auth } from "../../lib/auth";
import { AppError } from "../../lib/errors";
import type { NotificationService } from "./notification.service";

const requireAuthenticatedSession = async (
  headers: Headers
): Promise<string> => {
  const authSession = await auth.api.getSession({
    headers,
  });

  if (!authSession) {
    throw new AppError("UNAUTHORIZED", "Authentication is required");
  }

  return authSession.user.id;
};

export const createNotificationRoutes = (
  notificationService: NotificationService
) =>
  new Elysia({
    name: "notification-routes",
    prefix: "/notifications",
  })
    .derive(async ({ request }) => ({
      actorUserId: await requireAuthenticatedSession(request.headers),
    }))
    .get(
      "/",
      ({ actorUserId, query }) =>
        notificationService.listNotifications({
          ...query,
          userId: actorUserId,
        }),
      {
        query: t.Object({
          read: t.Optional(t.Boolean()),
        }),
        detail: {
          summary: "List notifications for a user",
          tags: ["Notification"],
        },
      }
    )
    .patch(
      "/:notificationId/read",
      ({ actorUserId, params }) =>
        notificationService.markAsRead(params.notificationId, actorUserId),
      {
        params: t.Object({
          notificationId: t.String(),
        }),
        detail: {
          summary: "Mark a notification as read",
          tags: ["Notification"],
        },
      }
    )
    .patch(
      "/read-all",
      ({ actorUserId }) => notificationService.markAllAsRead(actorUserId),
      {
        detail: {
          summary: "Mark all notifications as read",
          tags: ["Notification"],
        },
      }
    );
