import { create } from "zustand";

import type { ProposalScope, ProposalStatus } from "@/shared/lib/types";

export type ProposalStatusFilter = "all" | ProposalStatus;
export type ProposalScopeFilter = "all" | ProposalScope;

type ProposalsFilter = {
  scope: ProposalScopeFilter;
  search: string;
  status: ProposalStatusFilter;
};

type ProposalsFilterStore = {
  filter: ProposalsFilter;
  reset: () => void;
  setScope: (scope: ProposalScopeFilter) => void;
  setSearch: (search: string) => void;
  setStatus: (status: ProposalStatusFilter) => void;
};

const defaultFilter: ProposalsFilter = {
  scope: "all",
  search: "",
  status: "all",
};

const statuses = new Set<string>([
  "all",
  "pending",
  "approved",
  "rejected",
  "revision_requested",
]);
const scopes = new Set<string>(["all", "ormawa", "fakultas", "universitas"]);

export const isProposalStatusFilter = (
  value: string
): value is ProposalStatusFilter => statuses.has(value);

export const isProposalScopeFilter = (
  value: string
): value is ProposalScopeFilter => scopes.has(value);

export const useProposalsFilterStore = create<ProposalsFilterStore>((set) => ({
  filter: defaultFilter,
  reset: () => {
    set({ filter: defaultFilter });
  },
  setScope: (scope) => {
    set((state) => ({ filter: { ...state.filter, scope } }));
  },
  setSearch: (search) => {
    set((state) => ({ filter: { ...state.filter, search } }));
  },
  setStatus: (status) => {
    set((state) => ({ filter: { ...state.filter, status } }));
  },
}));
