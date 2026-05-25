import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { ActivityFeedCard } from "../components/activity-feed-card";
import { AdminStatTiles } from "../components/admin-stat-tiles";
import { SystemConfigCard } from "../components/system-config-card";
import { UserManagementCard } from "../components/user-management-card";
import { useActivityFeed } from "../hooks/use-activity-feed";
import { useConfigList } from "../hooks/use-config-list";
import { useUsersList } from "../hooks/use-users-list";

export function AdminContainer() {
  const usersQuery = useUsersList();
  const configQuery = useConfigList();
  const activityQuery = useActivityFeed();
  const error =
    usersQuery.error?.message ??
    configQuery.error?.message ??
    activityQuery.error?.message;

  const users = usersQuery.data ?? [];
  const configs = configQuery.data ?? [];
  const activity = activityQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle="User management, system config, activity audit"
        title="Admin"
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load admin data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {usersQuery.isPending ||
      configQuery.isPending ||
      activityQuery.isPending ? (
        <AdminSkeleton />
      ) : (
        <>
          <AdminStatTiles
            activityCount={activity.length}
            configCount={configs.length}
            sessionsCount={0}
            usersCount={users.length}
          />
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <UserManagementCard users={users} />
            <ActivityFeedCard entries={activity} />
          </div>
          <SystemConfigCard configs={configs} />
        </>
      )}
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <Skeleton className="h-28" key={key} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
