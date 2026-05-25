import {
  Calendar03Icon,
  DashboardSquare01Icon,
  FileEditIcon,
  Notification03Icon,
  Shield01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Link, useRouterState } from "@tanstack/react-router";

import { Badge } from "@/shared/components/ui/badge";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { useNotificationsCount } from "@/features/notification/hooks/use-notifications-count";
import { canAccess, RESOURCES, type Resource } from "@/shared/lib/permissions";

type NavItem = {
  accent?: boolean;
  badge?: number | null;
  icon: IconSvgElement;
  label: string;
  requires?: Resource;
  to:
    | "/dashboard/overview"
    | "/dashboard/events"
    | "/dashboard/proposals"
    | "/dashboard/committee"
    | "/dashboard/notifications"
    | "/dashboard/admin";
};

export function SidebarNavItems({ userRole }: { userRole: string }) {
  const { location } = useRouterState();
  const unread = useNotificationsCount();

  const items: NavItem[] = [
    {
      icon: DashboardSquare01Icon,
      label: "Overview",
      to: "/dashboard/overview",
    },
    { icon: Calendar03Icon, label: "Events", to: "/dashboard/events" },
    { icon: FileEditIcon, label: "Proposals", to: "/dashboard/proposals" },
    { icon: UserGroupIcon, label: "Committee", to: "/dashboard/committee" },
    {
      accent: true,
      badge: unread > 0 ? unread : null,
      icon: Notification03Icon,
      label: "Notifications",
      to: "/dashboard/notifications",
    },
    {
      icon: Shield01Icon,
      label: "Admin",
      requires: RESOURCES.ADMIN_PANEL,
      to: "/dashboard/admin",
    },
  ];

  const visibleItems = items.filter(
    (item) => !item.requires || canAccess(userRole, item.requires)
  );

  return (
    <SidebarMenu>
      {visibleItems.map((item) => (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton
            asChild
            isActive={location.pathname.startsWith(item.to)}
          >
            <Link
              aria-current={
                location.pathname.startsWith(item.to) ? "page" : undefined
              }
              to={item.to}
            >
              <HugeiconsIcon icon={item.icon} />
              <span>{item.label}</span>
              {item.badge ? (
                <Badge
                  className="ml-auto"
                  variant={item.accent ? "default" : "secondary"}
                >
                  {item.badge}
                </Badge>
              ) : null}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
