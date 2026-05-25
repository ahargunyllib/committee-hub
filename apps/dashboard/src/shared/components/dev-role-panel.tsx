import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

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
import { api } from "@/shared/lib/api";
import { isUserRole } from "@/shared/lib/permissions";
import { ROLE_DETAILS, ROLE_OPTIONS } from "@/shared/lib/roles";
import type { User } from "@/shared/lib/types";

const SESSION_ROLE_VALUE = "session";

export function DevRolePanel({ fallbackRole }: { fallbackRole: string }) {
  const router = useRouter();
  const roleOverride = useDevRoleOverride();
  const [open, setOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  if (!isDevRoleOverrideEnabled) {
    return null;
  }

  const sessionRole = fallbackRole;
  const effectiveRole = roleOverride ?? sessionRole;
  const effectiveRoleDetails = isUserRole(effectiveRole)
    ? ROLE_DETAILS[effectiveRole]
    : null;

  const handleRoleChange = async (value: string) => {
    if (value === SESSION_ROLE_VALUE) {
      setDevRoleOverride(null);
      await router.invalidate();
      return;
    }

    if (!isUserRole(value)) {
      return;
    }

    setPendingRole(value);

    try {
      const user = await api.patch<User>("/dev/session/role", {
        role: value,
      });

      setDevRoleOverride(null);
      await router.invalidate();
      toast.success(`Dev role updated to ${ROLE_DETAILS[user.role].label}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update dev role"
      );
    } finally {
      setPendingRole(null);
    }
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
        <PopoverContent align="end" className="w-80" side="top">
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
            disabled={pendingRole !== null}
            onValueChange={handleRoleChange}
            value={
              roleOverride ??
              (isUserRole(sessionRole) ? sessionRole : SESSION_ROLE_VALUE)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value={SESSION_ROLE_VALUE}>
                Use session role
              </SelectItem>
              {ROLE_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-xs">Effective</span>
              <RoleBadge role={effectiveRole} size="sm" />
            </div>
            {effectiveRoleDetails ? (
              <>
                <p className="mt-2 text-muted-foreground text-xs">
                  {effectiveRoleDetails.description}
                </p>
                <ul className="mt-2 space-y-1 text-xs">
                  {effectiveRoleDetails.capabilities.map((capability) => (
                    <li className="flex gap-2" key={capability}>
                      <span className="text-muted-foreground">-</span>
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <div className="space-y-2">
            <p className="font-medium text-xs">Role differences</p>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {ROLE_OPTIONS.map((item) => {
                const isActive = effectiveRole === item.value;
                const isSaving = pendingRole === item.value;

                return (
                  <button
                    className="w-full rounded-md border bg-background p-2 text-left transition-colors hover:bg-muted/50"
                    disabled={pendingRole !== null}
                    key={item.value}
                    onClick={async () => {
                      await handleRoleChange(item.value);
                    }}
                    type="button"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <RoleBadge role={item.value} size="sm" />
                      {isActive ? (
                        <span className="text-[10px] text-muted-foreground">
                          active
                        </span>
                      ) : null}
                      {!isActive && isSaving ? (
                        <span className="text-[10px] text-muted-foreground">
                          saving
                        </span>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {ROLE_DETAILS[item.value].description}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Development-only. Updates your database role through the dev
              endpoint.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
