import { useSyncExternalStore } from "react";

import { isUserRole } from "@/shared/lib/permissions";
import type { UserRole } from "@/shared/lib/types";

const ROLE_OVERRIDE_EVENT = "committee-hub:dev-role-override";
const ROLE_OVERRIDE_STORAGE_KEY = "committee-hub.dev.role-override";

export const isDevRoleOverrideEnabled = import.meta.env.DEV;

const emitRoleOverrideChange = () => {
  window.dispatchEvent(new Event(ROLE_OVERRIDE_EVENT));
};

export const getDevRoleOverride = (): UserRole | null => {
  if (!isDevRoleOverrideEnabled || typeof window === "undefined") {
    return null;
  }

  const role = window.localStorage.getItem(ROLE_OVERRIDE_STORAGE_KEY);
  return isUserRole(role) ? role : null;
};

export const setDevRoleOverride = (role: UserRole | null) => {
  if (!isDevRoleOverrideEnabled || typeof window === "undefined") {
    return;
  }

  if (role) {
    window.localStorage.setItem(ROLE_OVERRIDE_STORAGE_KEY, role);
  } else {
    window.localStorage.removeItem(ROLE_OVERRIDE_STORAGE_KEY);
  }

  emitRoleOverrideChange();
};

export const applyDevRoleOverride = <TUser extends { role: string }>(
  user: TUser,
  roleOverride: UserRole | null = getDevRoleOverride()
): TUser => (roleOverride ? { ...user, role: roleOverride } : user);

export function useDevRoleOverride() {
  return useSyncExternalStore(
    (listener) => {
      if (!isDevRoleOverrideEnabled || typeof window === "undefined") {
        return () => undefined;
      }

      window.addEventListener(ROLE_OVERRIDE_EVENT, listener);
      window.addEventListener("storage", listener);

      return () => {
        window.removeEventListener(ROLE_OVERRIDE_EVENT, listener);
        window.removeEventListener("storage", listener);
      };
    },
    getDevRoleOverride,
    () => null
  );
}
