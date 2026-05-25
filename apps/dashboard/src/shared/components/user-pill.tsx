import { useNavigate } from "@tanstack/react-router";

import { RoleBadge } from "@/shared/components/role-badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { authClient, type SessionUser } from "@/shared/lib/auth";
import { getInitials } from "@/shared/lib/string";

export function UserPill({ user }: { user: SessionUser }) {
  const navigate = useNavigate();
  const firstName = user.name.split(" ")[0] ?? user.name;

  const handleSignOut = async () => {
    await authClient.signOut();
    await navigate({ to: "/auth/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-full border p-1 pr-3 text-left transition-colors hover:bg-accent">
        <Avatar className="size-8">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col items-start">
          <span className="max-w-28 truncate font-medium text-xs">
            {firstName}
          </span>
          <RoleBadge role={user.role} size="sm" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
