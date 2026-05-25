import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";

import { Separator } from "../../shared/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../shared/components/ui/sidebar";
import { AppLogo } from "../../shared/components/app-logo";
import { SidebarNavItems } from "../../shared/components/sidebar-nav-items";
import { TopbarSearch } from "../../shared/components/topbar-search";
import { UserPill } from "../../shared/components/user-pill";
import { authClient } from "../../shared/lib/auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth/login" });
    }

    return { user: session.data.user };
  },
  component: DashboardLayout,
  loader: ({ location }) => {
    if (
      location.pathname === "/dashboard" ||
      location.pathname === "/dashboard/"
    ) {
      throw redirect({ to: "/dashboard/overview" });
    }
  },
});

function DashboardLayout() {
  const { user } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-14 items-center justify-center px-2">
          <Link
            aria-label="Committee Hub overview"
            className="flex h-9 min-w-0 items-center gap-2 rounded-md px-2 font-bold hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            to="/dashboard/overview"
          >
            <AppLogo />
            <span className="group-data-[collapsible=icon]:hidden">
              Committee Hub
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarNavItems userRole={user.role} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <UserPill user={user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="[--header-height:4rem]">
        <header className="sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur">
          <SidebarTrigger className="size-9" />
          <Separator className="h-6 w-px" orientation="vertical" />
          <Breadcrumb />
          <div className="ml-auto flex items-center gap-3">
            <TopbarSearch />
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Breadcrumb() {
  const { location } = useRouterState();
  const segment =
    location.pathname.split("/").filter(Boolean).at(-1) ?? "overview";
  const label = `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
  return <span className="font-medium text-sm">{label}</span>;
}
