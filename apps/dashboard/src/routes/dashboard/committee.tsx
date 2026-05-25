import { createFileRoute } from "@tanstack/react-router";

import { CommitteeContainer } from "../../features/committee/containers/committee-container";

export const Route = createFileRoute("/dashboard/committee")({
  component: CommitteeContainer,
});
