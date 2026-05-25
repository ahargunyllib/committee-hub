import { create } from "zustand";

type SelectedProposalStore = {
  id: string | null;
  setId: (id: string | null) => void;
};

export const useSelectedProposalStore = create<SelectedProposalStore>(
  (set) => ({
    id: null,
    setId: (id) => {
      set({ id });
    },
  })
);
