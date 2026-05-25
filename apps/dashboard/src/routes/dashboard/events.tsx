import { createFileRoute } from "@tanstack/react-router";

import { EventsGridContainer } from "@/features/event/containers/events-grid-container";

export const Route = createFileRoute("/dashboard/events")({
  component: EventsGridContainer,
});
