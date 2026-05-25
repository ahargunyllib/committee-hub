import { Activity03Icon } from "@hugeicons/core-free-icons";

import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelative } from "@/shared/lib/format";
import { getInitials } from "@/shared/lib/string";
import type { ActivityEntry } from "@/shared/lib/types";

export function ActivityFeedCard({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <EmptyState icon={Activity03Icon} title="No recent activity" />
        ) : (
          <ul className="divide-y">
            {entries.map((entry) => (
              <li className="flex items-center gap-3 p-3" key={entry.id}>
                <Avatar className="size-7">
                  <AvatarFallback>
                    {getInitials(entry.userName ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-medium">
                    {entry.userName ?? "System"}
                  </span>{" "}
                  <span className="text-muted-foreground">{entry.verb}</span>{" "}
                  <span className="truncate">{entry.target}</span>
                </div>
                <span className="font-mono text-muted-foreground/60 text-xs">
                  {formatRelative(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
