import { create } from "zustand";

import { isUserRole } from "@/shared/lib/permissions";
import type { UserRole } from "@/shared/lib/types";

export type UsersRoleFilter = "all" | UserRole;

type UsersFilterStore = {
  role: UsersRoleFilter;
  search: string;
  setRole: (role: UsersRoleFilter) => void;
  setSearch: (search: string) => void;
};

export const isUsersRoleFilter = (value: string): value is UsersRoleFilter =>
  value === "all" || isUserRole(value);

export const useUsersFilterStore = create<UsersFilterStore>((set) => ({
  role: "all",
  search: "",
  setRole: (role) => {
    set({ role });
  },
  setSearch: (search) => {
    set({ search });
  },
}));
