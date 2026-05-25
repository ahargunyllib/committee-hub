import { createFileRoute } from "@tanstack/react-router";

import { ProposalsContainer } from "../../features/proposal/containers/proposals-container";

export const Route = createFileRoute("/dashboard/proposals")({
  component: ProposalsContainer,
});
