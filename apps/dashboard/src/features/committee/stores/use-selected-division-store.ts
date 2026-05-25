import { create } from "zustand";

type SelectedDivisionStore = {
  id: string | null;
  setId: (id: string | null) => void;
};

export const useSelectedDivisionStore = create<SelectedDivisionStore>(
  (set) => ({
    id: null,
    setId: (id) => set({ id }),
  })
);
