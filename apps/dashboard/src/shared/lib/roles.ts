import type { UserRole } from "@/shared/lib/types";

export type RoleDetail = {
  capabilities: string[];
  description: string;
  label: string;
};

export const ROLE_DETAILS: Record<UserRole, RoleDetail> = {
  admin: {
    capabilities: [
      "Open the Admin panel",
      "Manage event lifecycle and ticket verification",
      "Use user, config, and activity management screens",
    ],
    description: "System operator with dashboard-wide management access.",
    label: "Admin Sistem",
  },
  fakultas: {
    capabilities: [
      "Review active faculty-level proposals",
      "Handle proposals escalated from Ormawa",
      "Approve, reject, or request proposal revisions",
    ],
    description: "Faculty reviewer for proposal approval workflow.",
    label: "Pihak Fakultas",
  },
  ketua_panitia: {
    capabilities: [
      "Create and manage events",
      "Verify event tickets",
      "Manage committee divisions for owned events",
    ],
    description: "Committee lead role for event execution and staffing.",
    label: "Ketua Panitia",
  },
  mahasiswa: {
    capabilities: [
      "Register to open events",
      "Submit and resubmit proposals",
      "Apply to committee divisions",
    ],
    description: "Default student role for participation workflows.",
    label: "Mahasiswa",
  },
  ormawa: {
    capabilities: [
      "Review active Ormawa-level proposals",
      "Start the proposal approval chain",
      "Approve, reject, or request proposal revisions",
    ],
    description: "Student organization reviewer for proposal intake.",
    label: "Pengurus Ormawa",
  },
  universitas: {
    capabilities: [
      "Review active university-level proposals",
      "Handle proposals escalated from faculty",
      "Complete the highest approval stage",
    ],
    description: "University reviewer for final proposal approval.",
    label: "Pihak Universitas",
  },
};

export const ROLE_OPTIONS: Array<{ label: string; value: UserRole }> = [
  { label: ROLE_DETAILS.mahasiswa.label, value: "mahasiswa" },
  { label: ROLE_DETAILS.ketua_panitia.label, value: "ketua_panitia" },
  { label: ROLE_DETAILS.ormawa.label, value: "ormawa" },
  { label: ROLE_DETAILS.fakultas.label, value: "fakultas" },
  { label: ROLE_DETAILS.universitas.label, value: "universitas" },
  { label: ROLE_DETAILS.admin.label, value: "admin" },
];

export const getRoleLabel = (role: UserRole) => ROLE_DETAILS[role].label;
