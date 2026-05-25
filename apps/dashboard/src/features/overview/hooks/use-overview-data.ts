import { useQueries } from "@tanstack/react-query";

import { api } from "@/shared/lib/api";
import type { Event, Notification, Proposal } from "@/shared/lib/types";

export type OverviewData = ReturnType<typeof useOverviewData>;

export function useOverviewData(userId: string | undefined) {
  const [openEvents, draftEvents, pendingProposals, revisionProposals, unread] =
    useQueries({
      queries: [
        {
          queryFn: () => api.get<Event[]>("/events", { status: "open" }),
          queryKey: ["events", "list", { status: "open" }],
        },
        {
          queryFn: () => api.get<Event[]>("/events", { status: "draft" }),
          queryKey: ["events", "list", { status: "draft" }],
        },
        {
          queryFn: () =>
            api.get<Proposal[]>("/proposals", { status: "pending" }),
          queryKey: ["proposals", "list", { status: "pending" }],
        },
        {
          queryFn: () =>
            api.get<Proposal[]>("/proposals", {
              status: "revision_requested",
            }),
          queryKey: ["proposals", "list", { status: "revision_requested" }],
        },
        {
          enabled: !!userId,
          queryFn: () =>
            api.get<Notification[]>("/notifications", {
              read: "false",
              userId: userId ?? "",
            }),
          queryKey: ["notifications", "list", { read: false, userId }],
        },
      ],
    });

  const pending = pendingProposals.data ?? [];
  const revisions = revisionProposals.data ?? [];

  return {
    draftEventsCount: draftEvents.data?.length ?? 0,
    isError:
      openEvents.isError ||
      draftEvents.isError ||
      pendingProposals.isError ||
      revisionProposals.isError ||
      unread.isError,
    isLoading:
      openEvents.isPending ||
      draftEvents.isPending ||
      pendingProposals.isPending ||
      revisionProposals.isPending ||
      unread.isPending,
    openEventsCount: openEvents.data?.length ?? 0,
    pendingProposalsCount: pending.length,
    proposalQueue: [...pending, ...revisions].slice(0, 5),
    revisionCount: revisions.length,
    unreadCount: unread.data?.length ?? 0,
    upcomingEvents: (openEvents.data ?? []).slice(0, 5),
  };
}
