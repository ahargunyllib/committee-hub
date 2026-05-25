# 08 — Admin Screen (Phase 10)

## Goal

Admin-only panel: stat tiles + user management + activity feed + system configuration.

## Prerequisites

Phase 0-9 done. Login sebagai user dengan role `admin`.

## Design Ref

> Four stat tiles at the top: Users, Config keys, Activity (24h), Sessions.
>
> Two-column grid (1.6fr / 1fr):
> - User management card — header has search input + role filter Select. Table columns: User (avatar+name+dept), Email (muted), Role (Select inline, disabled for self), "…" overflow icon.
> - Activity feed card — list of 8 entries: avatar + bold name + verb (muted) + target (truncated, dim mono date right).
>
> Below: System configuration card — table of key/value/type/description/updated/Edit. Values in mono badges. Add Key button + Edit/Create modal: key (disabled when editing), valueType select (string/number/boolean), value (validated against type), description textarea.

## API Endpoints

- `GET /admin/users`
- `PATCH /admin/users/:userId/role`
- `GET /admin/activity`
- `GET /admin/config`
- `PUT /admin/config/:key`

## Folder Structure

```
src/features/admin/
├── stores/
│   ├── use-users-filter-store.ts       # { search, role }
│   └── use-config-dialog-store.ts      # editing key state
├── hooks/
│   ├── use-users-list.ts
│   ├── use-update-user-role.ts
│   ├── use-activity-feed.ts
│   ├── use-config-list.ts
│   └── use-upsert-config-form.ts
├── containers/
│   └── admin-container.tsx
├── components/
│   ├── admin-stat-tiles.tsx
│   ├── user-management-card.tsx
│   ├── activity-feed-card.tsx
│   ├── system-config-card.tsx
│   └── config-edit-dialog.tsx
└── utils/
    └── value-type-validator.ts
```

## Helpers

### `utils/value-type-validator.ts`

```ts
export function validateConfigValue(value: string, type: "string" | "number" | "boolean" | "json"): string | null {
  if (type === "number" && Number.isNaN(Number(value))) return "Must be a number";
  if (type === "boolean" && value !== "true" && value !== "false") return "Must be 'true' or 'false'";
  if (type === "json") {
    try { JSON.parse(value); } catch { return "Must be valid JSON"; }
  }
  return null;
}
```

## File Outlines

### Route

```tsx
// src/routes/dashboard/admin.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminContainer } from "@/features/admin/containers/admin-container";

export const Route = createFileRoute("/dashboard/admin")({
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") {
      throw redirect({ to: "/dashboard/overview" });
    }
  },
  component: AdminContainer,
});
```

### `containers/admin-container.tsx`

```tsx
export function AdminContainer() {
  const { data: users } = useUsersList();
  const { data: configs } = useConfigList();
  const { data: activity } = useActivityFeed();

  return (
    <div className="space-y-6">
      <PageHeader title="Admin" subtitle="User management, system config, activity audit" />
      <AdminStatTiles
        usersCount={users?.length ?? 0}
        configCount={configs?.length ?? 0}
        activityCount={activity?.length ?? 0}
      />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <UserManagementCard users={users ?? []} />
        <ActivityFeedCard entries={activity ?? []} />
      </div>
      <SystemConfigCard configs={configs ?? []} />
    </div>
  );
}
```

### `components/user-management-card.tsx`

```tsx
export function UserManagementCard({ users }) {
  const { search, role: filterRole, setSearch, setRole } = useUsersFilterStore();
  const { data: session } = useSession();
  const updateRole = useUpdateUserRole();

  const filtered = users.filter((u) =>
    (filterRole === "all" || u.role === filterRole) &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <CardTitle>User management</CardTitle>
        <div className="ml-auto flex items-center gap-2">
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
          <Select value={filterRole} onValueChange={setRole}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
              <SelectItem value="ketua_panitia">Ketua Panitia</SelectItem>
              <SelectItem value="ormawa">Pengurus Ormawa</SelectItem>
              <SelectItem value="fakultas">Pihak Fakultas</SelectItem>
              <SelectItem value="universitas">Pihak Universitas</SelectItem>
              <SelectItem value="admin">Admin Sistem</SelectItem>
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
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7"><AvatarFallback>{getInitials(u.name)}</AvatarFallback></Avatar>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    onValueChange={(role) => updateRole.mutate({ userId: u.id, role })}
                    disabled={u.id === session?.user.id}
                  >
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>{/* roles ... */}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>…</DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {/* future: disable, delete, etc */}
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
```

### `components/activity-feed-card.tsx`

```tsx
export function ActivityFeedCard({ entries }) {
  return (
    <Card>
      <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {entries.map((a) => (
            <li key={a.id} className="flex items-center gap-3 p-3">
              <Avatar className="size-7"><AvatarFallback>{getInitials(a.userName ?? "?")}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium">{a.userName}</span>{" "}
                <span className="text-muted-foreground">{a.verb}</span>{" "}
                <span className="truncate">{a.target}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground/60">{formatRelative(a.createdAt)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

### `components/system-config-card.tsx`

```tsx
export function SystemConfigCard({ configs }) {
  const [editKey, setEditKey] = useState<string | null>(null);
  const editing = configs.find((c) => c.key === editKey);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>System configuration</CardTitle>
        <Button size="sm" onClick={() => setEditKey("__new__")}>Add Key</Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((c) => (
              <TableRow key={c.key}>
                <TableCell className="font-mono text-xs">{c.key}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs">{c.value}</code>
                </TableCell>
                <TableCell>{c.valueType}</TableCell>
                <TableCell className="text-muted-foreground">{c.description}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground/60">{formatRelative(c.updatedAt)}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => setEditKey(c.key)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <ConfigEditDialog
        open={editKey !== null}
        onOpenChange={(o) => !o && setEditKey(null)}
        existing={editKey === "__new__" ? null : editing ?? null}
      />
    </Card>
  );
}
```

### `components/config-edit-dialog.tsx`

Form: key (Input, disabled saat editing), valueType Select, value Input (placeholder/validation per type), description Textarea.

```tsx
const isEditing = !!existing;
const schema = z.object({
  key: z.string().min(1),
  valueType: z.enum(["string","number","boolean","json"]),
  value: z.string().min(1),
  description: z.string().optional(),
});

const form = useForm({
  defaultValues: existing ? { ...existing, value: existing.value } : { key: "", valueType: "string", value: "", description: "" },
  validators: {
    onChange: schema,
    onSubmit: ({ value }) => {
      const err = validateConfigValue(value.value, value.valueType);
      return err ? { fields: { value: err } } : undefined;
    },
  },
  onSubmit: async ({ value }) => mutation.mutateAsync(value),
});
```

PUT `/admin/config/:key` dengan body `{ value, valueType, description, updatedById: session.user.id }`.

### `hooks/use-update-user-role.ts`

```ts
export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      api.patch<User>(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role updated");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });
}
```

## Edge Cases

- Self user role select disabled (cannot change own role).
- Config value validation harus pass sebelum submit.
- Activity feed empty → "No recent activity".

## Acceptance Criteria

- Non-admin redirected.
- Stat tiles render counts.
- Search + role filter di user table works.
- Change role → API call + toast.
- Add/Edit config → modal validation, save.

## Commit

```
feat(dashboard): add admin screen
```
