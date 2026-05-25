# 02 — Layout + Login (Phases 3-4)

## Phase 3 — Protected Dashboard Layout

### Goal

Setup root context, redirect dari `/`, dan layout `/dashboard/*` dengan sidebar + topbar + auth guard.

### Prerequisites

Phase 0-2 done. Shadcn `sidebar`, `separator`, `dropdown-menu`, `avatar`, `badge`, `button`, `tooltip`, `scroll-area` sudah ter-install.

### Tasks

#### 3.1 Update `src/main.tsx`

Wrap dengan `QueryClientProvider`, `TooltipProvider`, dan tambah `Toaster`.

```tsx
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { routeTree } from "./routeTree.gen";
import { createQueryClient } from "@/shared/lib/query-client";

const queryClient = createQueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="bottom-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
```

#### 3.2 Update `src/routes/__root.tsx`

Tambah context type + Devtools.

```tsx
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import "@/index.css";

export type RouterAppContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      { title: "Committee Hub" },
      { name: "description", content: "Campus event & committee management" },
      { name: "robots", content: "noindex, nofollow" },
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
```

#### 3.3 Update `src/routes/index.tsx`

Redirect ke dashboard.

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard/overview" });
  },
});
```

#### 3.4 Buat `src/routes/dashboard/route.tsx`

```tsx
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/shared/lib/auth";
import { canAccess, RESOURCES } from "@/shared/lib/permissions";
import { SidebarNavItems } from "@/shared/components/sidebar-nav-items";
import { TopbarSearch } from "@/shared/components/topbar-search";
import { UserPill } from "@/shared/components/user-pill";
import { AppLogo } from "@/shared/components/app-logo";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth/login" });
    }
    return { user: session.data.user };
  },
  loader: ({ location }) => {
    if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
      throw redirect({ to: "/dashboard/overview" });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex h-16 justify-center">
          <Link to="/dashboard/overview" className="flex items-center gap-2 px-2 font-bold">
            <AppLogo />
            <span>Committee Hub</span>
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
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-6" />
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
  const segment = location.pathname.split("/").filter(Boolean).at(-1) ?? "overview";
  const label = segment.charAt(0).toUpperCase() + segment.slice(1);
  return <span className="text-sm font-medium">{label}</span>;
}
```

#### 3.5 Buat placeholder routes `/dashboard/<screen>.tsx`

Untuk: overview, events, proposals, committee, notifications, admin. Setiap file minimal:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/overview")({
  component: () => <div>Overview (TBD)</div>,
});
```

Catatan: `admin.tsx` tambahkan `beforeLoad` redirect:

```tsx
beforeLoad: ({ context }) => {
  if (context.user.role !== "admin") {
    throw redirect({ to: "/dashboard/overview" });
  }
}
```

#### 3.6 Shared components

##### `src/shared/components/app-logo.tsx`

```tsx
export function AppLogo({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="grid place-items-center rounded-md bg-primary text-primary-foreground font-bold"
    >
      C
    </div>
  );
}
```

##### `src/shared/components/sidebar-nav-items.tsx`

```tsx
import { Link, useRouterState } from "@tanstack/react-router";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Calendar03Icon,
  FileEditIcon,
  UserGroupIcon,
  Notification03Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { canAccess, RESOURCES } from "@/shared/lib/permissions";
import { useNotificationsCount } from "@/features/notification/hooks/use-notifications-count";

type Props = { userRole: string };

export function SidebarNavItems({ userRole }: Props) {
  const { location } = useRouterState();
  const unread = useNotificationsCount(); // returns number

  const items = [
    { to: "/dashboard/overview", label: "Overview", icon: DashboardSquare01Icon },
    { to: "/dashboard/events", label: "Events", icon: Calendar03Icon },
    { to: "/dashboard/proposals", label: "Proposals", icon: FileEditIcon },
    { to: "/dashboard/committee", label: "Committee", icon: UserGroupIcon },
    {
      to: "/dashboard/notifications",
      label: "Notifications",
      icon: Notification03Icon,
      badge: unread > 0 ? unread : null,
      accent: true,
    },
    {
      to: "/dashboard/admin",
      label: "Admin",
      icon: Shield01Icon,
      requires: RESOURCES.ADMIN_PANEL,
    },
  ];

  const visible = items.filter((i) => !i.requires || canAccess(userRole, i.requires));

  return (
    <SidebarMenu>
      {visible.map((item) => (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton
            isActive={location.pathname.startsWith(item.to)}
            asChild
          >
            <Link to={item.to}>
              <HugeiconsIcon icon={item.icon} />
              <span>{item.label}</span>
              {item.badge ? (
                <Badge variant={item.accent ? "default" : "secondary"} className="ml-auto">
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
```

> `useNotificationsCount` belum dibuat. Bisa stub return 0 di Phase 3, isi proper di Phase 9.

##### `src/shared/components/topbar-search.tsx`

Stub dulu — actual search debounced + global query untuk Phase 11 polish.

```tsx
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

export function TopbarSearch() {
  return (
    <div className="relative hidden md:block">
      <HugeiconsIcon
        icon={Search01Icon}
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input placeholder="Search..." className="w-64 pl-9" />
    </div>
  );
}
```

##### `src/shared/components/user-pill.tsx`

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authClient, type SessionUser } from "@/shared/lib/auth";
import { RoleBadge } from "@/components/shared/role-badge";
import { getInitials } from "@/shared/lib/string";
import { useNavigate } from "@tanstack/react-router";

export function UserPill({ user }: { user: SessionUser }) {
  const navigate = useNavigate();
  const firstName = user.name.split(" ")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-full border p-1 pr-3 hover:bg-accent">
        <Avatar className="size-8">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-medium">{firstName}</span>
          <RoleBadge role={user.role} size="sm" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={async () => {
            await authClient.signOut();
            navigate({ to: "/auth/login" });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

##### `src/components/shared/role-badge.tsx`

```tsx
import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  mahasiswa: "Mahasiswa",
  ketua_panitia: "Ketua Panitia",
  ormawa: "Pengurus Ormawa",
  fakultas: "Pihak Fakultas",
  universitas: "Pihak Universitas",
  admin: "Admin Sistem",
};

export function RoleBadge({ role, size = "md" }: { role: string; size?: "sm" | "md" }) {
  return (
    <Badge variant="secondary" className={size === "sm" ? "text-[10px]" : ""}>
      {LABELS[role] ?? role}
    </Badge>
  );
}
```

##### `src/components/shared/status-badge.tsx`

```tsx
import { cn } from "@/lib/utils";
import type { StatusVariant } from "@/features/event/utils/variant-mapper";

const STYLES: Record<StatusVariant, string> = {
  draft: "bg-status-draft-bg text-status-draft-fg border-status-draft-border",
  success: "bg-status-success-bg text-status-success-fg border-status-success-border",
  pending: "bg-status-pending-bg text-status-pending-fg border-status-pending-border",
  danger: "bg-status-danger-bg text-status-danger-fg border-status-danger-border",
  info: "bg-status-info-bg text-status-info-fg border-status-info-border",
};

export function StatusBadge({
  variant,
  label,
  dot,
  className,
}: {
  variant: StatusVariant;
  label: string;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium",
        STYLES[variant],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current opacity-80" /> : null}
      {label}
    </span>
  );
}
```

##### `src/components/shared/empty-state.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { HugeiconsIcon, type IconSvgObject } from "@hugeicons/react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconSvgObject;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
      <div className="grid size-12 place-items-center rounded-lg bg-muted">
        <HugeiconsIcon icon={icon} className="size-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium">{title}</h3>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {action ? (
        <Button variant="ghost" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
```

##### `src/components/shared/page-header.tsx`

```tsx
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
```

##### `src/components/shared/stat-tile.tsx`

```tsx
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function StatTile({
  label,
  value,
  delta,
  foot,
  trailing,
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  foot?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {trailing}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums tracking-tight">{value}</span>
        {delta ? <span className="text-xs text-muted-foreground">{delta}</span> : null}
      </div>
      {foot ? <p className="mt-2 text-xs text-muted-foreground">{foot}</p> : null}
    </Card>
  );
}
```

### Acceptance Criteria

- `/` redirect ke `/dashboard/overview`.
- `/dashboard/overview` (unauthenticated) → redirect ke `/auth/login`.
- After login (Phase 4) → sidebar render dengan 6 items (Admin hidden untuk role bukan admin).
- Toggle sidebar works.
- User pill di footer sidebar (atau topbar) menampilkan name + role badge + sign-out.
- Tidak ada typecheck error.

### Commit

```
feat(dashboard): add protected dashboard layout with sidebar + topbar
```

---

## Phase 4 — Login Screen

### Goal

Implement `/auth/login` dengan Google OAuth flow.

### Prerequisites

Phase 0-3 done. Backend (apps/api) jalan dengan Google OAuth configured (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` di env).

### Tasks

#### 4.1 Buat `src/routes/auth/login.tsx`

```tsx
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppLogo } from "@/shared/components/app-logo";
import { authClient } from "@/shared/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/auth/login")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: "/dashboard/overview" });
    }
  },
  component: LoginScreen,
});

function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard/overview",
    });
    // Better-auth redirects; loading state will persist briefly.
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/50 p-4">
      <Card className="w-full max-w-sm space-y-6 p-8 shadow-lg">
        <div className="flex flex-col items-center gap-3 text-center">
          <AppLogo size={36} />
          <div>
            <h1 className="text-lg font-semibold">Committee Hub</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Campus event & committee management
            </p>
          </div>
        </div>
        <Button onClick={handleSignIn} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner /> Signing you in…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <GoogleLogo /> Continue with Google
            </span>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          New accounts join as <code className="rounded bg-muted px-1 py-0.5 font-mono">mahasiswa</code>.
        </p>
      </Card>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.614z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
```

### Acceptance Criteria

- `/auth/login` accessible tanpa session.
- Klik "Continue with Google" → redirect ke Google → kembali ke `/dashboard/overview` setelah sukses.
- Kalau sudah login dan buka `/auth/login` → redirect ke `/dashboard/overview`.
- Loading state tampak saat sign-in.

### Commit

```
feat(dashboard): add login screen
```
