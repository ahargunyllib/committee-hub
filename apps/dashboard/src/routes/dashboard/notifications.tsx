import { createFileRoute } from "@tanstack/react-router";

import { NotificationsContainer } from "../../features/notification/containers/notifications-container";

export const Route = createFileRoute("/dashboard/notifications")({
  component: NotificationsContainer,
});
