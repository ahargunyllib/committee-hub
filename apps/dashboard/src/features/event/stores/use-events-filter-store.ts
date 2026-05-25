import { create } from "zustand";

export type EventsFilterStatus = "all" | "open" | "draft" | "closed";
export type EventsFilterType = "all" | "internal" | "external";

type EventsFilter = {
  search: string;
  status: EventsFilterStatus;
  type: EventsFilterType;
};

type EventsFilterStore = {
  filter: EventsFilter;
  reset: () => void;
  setSearch: (search: string) => void;
  setStatus: (status: EventsFilterStatus) => void;
  setType: (type: EventsFilterType) => void;
};

const defaultFilter: EventsFilter = {
  search: "",
  status: "all",
  type: "all",
};

const statuses = new Set<string>(["all", "open", "draft", "closed"]);
const types = new Set<string>(["all", "internal", "external"]);

export const isEventsFilterStatus = (
  value: string
): value is EventsFilterStatus => statuses.has(value);

export const isEventsFilterType = (value: string): value is EventsFilterType =>
  types.has(value);

export const useEventsFilterStore = create<EventsFilterStore>((set) => ({
  filter: defaultFilter,
  reset: () => {
    set({ filter: defaultFilter });
  },
  setSearch: (search) => {
    set((state) => ({ filter: { ...state.filter, search } }));
  },
  setStatus: (status) => {
    set((state) => ({ filter: { ...state.filter, status } }));
  },
  setType: (type) => {
    set((state) => ({ filter: { ...state.filter, type } }));
  },
}));
