import { Badge } from "@/shared/components/ui/badge";
import { isUserRole } from "@/shared/lib/permissions";
import type { UserRole } from "@/shared/lib/types";

const LABELS: Record<UserRole, string> = {
  admin: "Admin Sistem",
  fakultas: "Pihak Fakultas",
  ketua_panitia: "Ketua Panitia",
  mahasiswa: "Mahasiswa",
  ormawa: "Pengurus Ormawa",
  universitas: "Pihak Universitas",
};

export function RoleBadge({
  role,
  size = "md",
}: {
  role: string;
  size?: "sm" | "md";
}) {
  const label = isUserRole(role) ? LABELS[role] : role;

  return (
    <Badge className={size === "sm" ? "text-[10px]" : ""} variant="secondary">
      {label}
    </Badge>
  );
}
