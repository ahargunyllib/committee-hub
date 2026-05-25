import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "@tedx-2026/ui/globals.css";

// biome-ignore lint/complexity/noBannedTypes: TODO
export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Dashboard",
      },
      {
        name: "description",
        content: "The dashboard for Committee Hub",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
