import { MoreHorizontalIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { RoleBadge } from "@/components/shared/role-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials } from "@/shared/lib/string";
import { isUserRole } from "@/shared/lib/permissions";
import type { User, UserRole } from "@/shared/lib/types";
import { useSession } from "@/shared/lib/auth";

import { useUpdateUserRole } from "../hooks/use-update-user-role";
import {
  isUsersRoleFilter,
  useUsersFilterStore,
} from "../stores/use-users-filter-store";

const roleItems: Array<{ label: string; value: UserRole }> = [
  { label: "Mahasiswa", value: "mahasiswa" },
  { label: "Ketua Panitia", value: "ketua_panitia" },
  { label: "Pengurus Ormawa", value: "ormawa" },
  { label: "Pihak Fakultas", value: "fakultas" },
  { label: "Pihak Universitas", value: "universitas" },
  { label: "Admin Sistem", value: "admin" },
];

export function UserManagementCard({ users }: { users: User[] }) {
  const { data: session } = useSession();
  const { role, search, setRole, setSearch } = useUsersFilterStore();
  const updateRole = useUpdateUserRole();
  const normalizedSearch = search.toLowerCase();
  const filtered = users.filter(
    (user) =>
      (role === "all" || user.role === role) &&
      (!normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch))
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <CardTitle>User management</CardTitle>
        <div className="flex flex-col gap-2 lg:ml-auto lg:flex-row">
          <div className="relative">
            <HugeiconsIcon
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              icon={Search01Icon}
            />
            <Input
              className="pl-9 lg:w-52"
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search..."
              value={search}
            />
          </div>
          <Select
            onValueChange={(value) => {
              if (isUsersRoleFilter(value)) {
                setRole(value);
              }
            }}
            value={role}
          >
            <SelectTrigger className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Select
                    disabled={user.id === session?.user.id}
                    onValueChange={(value) => {
                      if (isUserRole(value)) {
                        updateRole.mutate({ role: value, userId: user.id });
                      }
                    }}
                    value={user.role}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label="Open user actions"
                        size="icon"
                        variant="ghost"
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled>
                        <RoleBadge role={user.role} />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
