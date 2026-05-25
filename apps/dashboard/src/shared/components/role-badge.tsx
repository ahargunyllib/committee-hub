import { Badge } from "@/shared/components/ui/badge";
import { isUserRole } from "@/shared/lib/permissions";
import { getRoleLabel } from "@/shared/lib/roles";

export function RoleBadge({
  role,
  size = "md",
}: {
  role: string;
  size?: "sm" | "md";
}) {
  const label = isUserRole(role) ? getRoleLabel(role) : role;

  return (
    <Badge className={size === "sm" ? "text-[10px]" : ""} variant="secondary">
      {label}
    </Badge>
  );
}
