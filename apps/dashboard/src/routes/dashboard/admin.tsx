import { createFileRoute, redirect } from "@tanstack/react-router";

import { AdminContainer } from "@/features/admin/containers/admin-container";

export const Route = createFileRoute("/dashboard/admin")({
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") {
      throw redirect({ to: "/dashboard/overview" });
    }
  },
  component: AdminContainer,
});
