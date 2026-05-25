import { create } from "zustand";

export type NotificationsTab = "all" | "unread" | "read";

type NotificationsFilterStore = {
  tab: NotificationsTab;
  setTab: (tab: NotificationsTab) => void;
};

export const useNotificationsFilterStore = create<NotificationsFilterStore>(
  (set) => ({
    tab: "all",
    setTab: (tab) => set({ tab }),
  })
);
