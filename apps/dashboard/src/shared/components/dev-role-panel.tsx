import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { RoleBadge } from "@/shared/components/role-badge";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  isDevRoleOverrideEnabled,
  setDevRoleOverride,
  useDevRoleOverride,
} from "@/shared/hooks/use-dev-role-override";
import { authClient } from "@/shared/lib/auth";
import { isUserRole } from "@/shared/lib/permissions";
import type { UserRole } from "@/shared/lib/types";

const SESSION_ROLE_VALUE = "session";

const roleItems: Array<{ label: string; value: UserRole }> = [
  { label: "Mahasiswa", value: "mahasiswa" },
  { label: "Ketua Panitia", value: "ketua_panitia" },
  { label: "Pengurus Ormawa", value: "ormawa" },
  { label: "Pihak Fakultas", value: "fakultas" },
  { label: "Pihak Universitas", value: "universitas" },
  { label: "Admin Sistem", value: "admin" },
];

export function DevRolePanel({ fallbackRole }: { fallbackRole: string }) {
  const router = useRouter();
  const roleOverride = useDevRoleOverride();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  if (!isDevRoleOverrideEnabled) {
    return null;
  }

  const sessionRole = session?.user.role ?? fallbackRole;
  const effectiveRole = roleOverride ?? sessionRole;

  const handleRoleChange = async (value: string) => {
    setDevRoleOverride(isUserRole(value) ? value : null);
    await router.invalidate();
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-label="Toggle dev role panel"
            className="h-8 gap-2 rounded-full px-3 shadow-md"
            variant={roleOverride ? "default" : "secondary"}
          >
            Dev
            <RoleBadge role={effectiveRole} size="sm" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72" side="top">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-sm">Dev role</p>
              <p className="mt-1 text-muted-foreground text-xs">
                Session <RoleBadge role={sessionRole} size="sm" />
              </p>
            </div>
            <Button
              onClick={() => {
                setOpen(false);
              }}
              size="sm"
              variant="ghost"
            >
              Close
            </Button>
          </div>
          <Select
            onValueChange={handleRoleChange}
            value={roleOverride ?? SESSION_ROLE_VALUE}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value={SESSION_ROLE_VALUE}>
                Use session role
              </SelectItem>
              {roleItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between rounded-md border bg-muted/30 p-2">
            <span className="text-muted-foreground text-xs">Effective</span>
            <RoleBadge role={effectiveRole} size="sm" />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
