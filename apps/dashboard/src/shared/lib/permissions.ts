import type { UserRole } from "@/shared/lib/types";

export const ROLES = {
  ADMIN: "admin",
  FAKULTAS: "fakultas",
  KETUA_PANITIA: "ketua_panitia",
  MAHASISWA: "mahasiswa",
  ORMAWA: "ormawa",
  UNIVERSITAS: "universitas",
} as const;

export const RESOURCES = {
  ADMIN_PANEL: "admin_panel",
  CREATE_DIVISION: "create_division",
  CREATE_EVENT: "create_event",
  REVIEW_APPLICATION: "review_application",
  REVIEW_FAKULTAS: "review_fakultas",
  REVIEW_ORMAWA: "review_ormawa",
  REVIEW_UNIVERSITAS: "review_universitas",
  VERIFY_TICKET: "verify_ticket",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];

const USER_ROLES = new Set<string>(Object.values(ROLES));

const PERMISSIONS: Record<Resource, readonly UserRole[]> = {
  admin_panel: [ROLES.ADMIN],
  create_division: [ROLES.KETUA_PANITIA, ROLES.ADMIN],
  create_event: [ROLES.KETUA_PANITIA, ROLES.ADMIN],
  review_application: [ROLES.KETUA_PANITIA, ROLES.ADMIN],
  review_fakultas: [ROLES.FAKULTAS],
  review_ormawa: [ROLES.ORMAWA],
  review_universitas: [ROLES.UNIVERSITAS],
  verify_ticket: [ROLES.KETUA_PANITIA, ROLES.ADMIN],
};

export const isUserRole = (role: string | null | undefined): role is UserRole =>
  !!role && USER_ROLES.has(role);

export const canAccess = (
  role: string | null | undefined,
  resource: Resource
): boolean => isUserRole(role) && PERMISSIONS[resource].includes(role);
