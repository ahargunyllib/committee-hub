import { createFileRoute } from "@tanstack/react-router";

import { OverviewContainer } from "@/features/overview/containers/overview-container";

export const Route = createFileRoute("/dashboard/overview")({
  component: OverviewContainer,
});
