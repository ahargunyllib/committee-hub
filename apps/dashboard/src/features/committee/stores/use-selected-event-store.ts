import { create } from "zustand";

type SelectedEventStore = {
  id: string | null;
  setId: (id: string | null) => void;
};

export const useSelectedEventStore = create<SelectedEventStore>((set) => ({
  id: null,
  setId: (id) => set({ id }),
}));
