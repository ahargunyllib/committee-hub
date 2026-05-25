import { StatTile } from "@/components/shared/stat-tile";

export function AdminStatTiles({
  activityCount,
  configCount,
  sessionsCount,
  usersCount,
}: {
  activityCount: number;
  configCount: number;
  sessionsCount: number;
  usersCount: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Users" value={usersCount} />
      <StatTile label="Config keys" value={configCount} />
      <StatTile foot="last page" label="Activity" value={activityCount} />
      <StatTile
        foot="active auth sessions"
        label="Sessions"
        value={sessionsCount}
      />
    </div>
  );
}
