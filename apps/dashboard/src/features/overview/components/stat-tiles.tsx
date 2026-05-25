import { StatTile } from "@/shared/components/stat-tile";

import type { OverviewData } from "../hooks/use-overview-data";

export function StatTiles({ data }: { data: OverviewData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        foot="api.committee-hub"
        label="System health"
        trailing={<span className="size-2 rounded-full bg-emerald-500" />}
        value={<span className="text-xl">OK</span>}
      />
      <StatTile
        delta={`(${data.draftEventsCount}) draft`}
        foot="Total this semester"
        label="Open events"
        value={data.openEventsCount}
      />
      <StatTile
        delta={
          data.revisionCount > 0
            ? `(${data.revisionCount}) need revision`
            : null
        }
        label="Pending proposals"
        value={data.pendingProposalsCount}
      />
      <StatTile
        label="Unread notifications"
        trailing={<span className="size-2 rounded-full bg-primary" />}
        value={data.unreadCount}
      />
    </div>
  );
}
