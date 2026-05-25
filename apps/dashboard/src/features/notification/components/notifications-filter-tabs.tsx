import { Badge } from "@/shared/components/ui/badge";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group";

import {
  type NotificationsTab,
  useNotificationsFilterStore,
} from "../stores/use-notifications-filter-store";

type NotificationCounts = {
  all: number;
  unread: number;
  read: number;
};

type NotificationsFilterTabsProps = {
  counts: NotificationCounts;
};

function isNotificationsTab(value: string): value is NotificationsTab {
  return value === "all" || value === "unread" || value === "read";
}

export function NotificationsFilterTabs({
  counts,
}: NotificationsFilterTabsProps) {
  const tab = useNotificationsFilterStore((state) => state.tab);
  const setTab = useNotificationsFilterStore((state) => state.setTab);

  return (
    <ToggleGroup
      onValueChange={(value) => {
        if (isNotificationsTab(value)) {
          setTab(value);
        }
      }}
      spacing={1}
      type="single"
      value={tab}
      variant="outline"
    >
      <ToggleGroupItem value="all">
        All
        <Badge className="ml-1" variant="secondary">
          {counts.all}
        </Badge>
      </ToggleGroupItem>
      <ToggleGroupItem value="unread">
        Unread
        <Badge className="ml-1" variant="secondary">
          {counts.unread}
        </Badge>
      </ToggleGroupItem>
      <ToggleGroupItem value="read">
        Read
        <Badge className="ml-1" variant="secondary">
          {counts.read}
        </Badge>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
