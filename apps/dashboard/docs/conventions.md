# Conventions

## File & Folder Naming

- **Files**: `kebab-case.ts` / `kebab-case.tsx` (mis. `event-card.tsx`, `use-create-event-form.ts`).
- **React components**: PascalCase di code, file kebab-case.
- **Hooks**: `use-*.ts`, return tuple/object.
- **Zustand stores**: `use-<feature>-<purpose>-store.ts` (mis. `use-events-filter-store.ts`).
- **Containers**: `<feature>-<purpose>-container.tsx` (mis. `events-grid-container.tsx`).
- **Types**: namespace per domain (`features/event/types/event.ts`).
- **No barrel files** (`index.ts` re-export everything) — Ultracite/Biome rule. Import langsung dari file.

## TypeScript

- Strict mode, no `any`. `unknown` for genuinely unknown.
- Const assertions untuk literal types.
- Avoid type assertions; pakai narrowing.
- Inferred function returns OK, kecuali API/exported helper di mana explicit return type meningkatkan clarity.

## Imports

- Path alias `@/*` → `src/*`.
- Order: external libs → `@/shared/*` → `@/features/*` → `@/components/*` → relative `./`.
- No namespace imports (`import * as X`). Pakai named.

## TanStack Query

### Query Keys

Pakai array kebab-case, namespaced per modul:

```ts
["events", "list", filter]
["events", "detail", eventId]
["proposals", "list", filter]
["proposals", "detail", proposalId]
["proposals", "approvals", proposalId]
["divisions", "list", eventId]
["divisions", "detail", divisionId]
["applications", "list", divisionId]
["notifications", "list", { userId, read }]
["users", "list"]
["config", "list"]
["activity", "list"]
["session"] // current user
```

### Defaults

`shared/lib/query-client.ts`:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Mutations

- Selalu invalidate relevant query keys di `onSuccess`.
- Tampilkan toast (`sonner`) di `onSuccess` (success) + `onError` (error.message).
- Pakai `useMutation({ mutationFn, onSuccess, onError })` (bukan tRPC mutation options karena kita pakai REST).

Contoh pattern:

```ts
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (input: CreateEventInput) => api.post<Event>("/events", input),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
    toast.success("Event created");
  },
  onError: (error: ApiError) => {
    toast.error(error.message);
  },
});
```

## Error Handling

### ApiError envelope

```ts
class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;
  requestId?: string;
  status: number;
}
```

Mapping `code` → user-facing label di `shared/lib/api.ts` (atau tampilkan apa adanya).

### React boundaries

- Tiap container: handle `isPending` (skeleton), `isError` (inline alert dengan retry), `isSuccess && empty` (EmptyState).

## Form Pattern (TanStack Form + Zod)

```ts
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Required"),
  quota: z.number().int().min(1),
});

type Input = z.infer<typeof schema>;

const form = useForm({
  defaultValues: { name: "", quota: 1 } satisfies Input,
  validators: { onChange: schema },
  onSubmit: async ({ value }) => {
    await mutation.mutateAsync(value);
  },
});
```

Render via `form.Field name="..."` dan integrate ke shadcn `Input`/`Textarea`/`Select`. Tampilkan field state error via `field.state.meta.errors`.

## Zustand Store Pattern

```ts
import { create } from "zustand";

type EventsFilter = {
  search: string;
  status: "all" | "open" | "draft" | "closed";
  type: "all" | "internal" | "external";
};

type Store = {
  filter: EventsFilter;
  setSearch: (search: string) => void;
  setStatus: (status: EventsFilter["status"]) => void;
  setType: (type: EventsFilter["type"]) => void;
  reset: () => void;
};

const defaultFilter: EventsFilter = { search: "", status: "all", type: "all" };

export const useEventsFilterStore = create<Store>((set) => ({
  filter: defaultFilter,
  setSearch: (search) => set((s) => ({ filter: { ...s.filter, search } })),
  setStatus: (status) => set((s) => ({ filter: { ...s.filter, status } })),
  setType: (type) => set((s) => ({ filter: { ...s.filter, type } })),
  reset: () => set({ filter: defaultFilter }),
}));
```

## Permissions Helper

`shared/lib/permissions.ts`:

```ts
export const ROLES = {
  MAHASISWA: "mahasiswa",
  KETUA_PANITIA: "ketua_panitia",
  ORMAWA: "ormawa",
  FAKULTAS: "fakultas",
  UNIVERSITAS: "universitas",
  ADMIN: "admin",
} as const;

export const RESOURCES = {
  CREATE_EVENT: "create_event",
  REVIEW_ORMAWA: "review_ormawa",
  REVIEW_FAKULTAS: "review_fakultas",
  REVIEW_UNIVERSITAS: "review_universitas",
  ADMIN_PANEL: "admin_panel",
  CREATE_DIVISION: "create_division",
  REVIEW_APPLICATION: "review_application",
  VERIFY_TICKET: "verify_ticket",
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];
type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];

const PERMISSIONS: Record<Resource, readonly Role[]> = {
  create_event: [ROLES.KETUA_PANITIA, ROLES.ADMIN],
  review_ormawa: [ROLES.ORMAWA],
  review_fakultas: [ROLES.FAKULTAS],
  review_universitas: [ROLES.UNIVERSITAS],
  admin_panel: [ROLES.ADMIN],
  create_division: [ROLES.KETUA_PANITIA, ROLES.ADMIN],
  review_application: [ROLES.KETUA_PANITIA, ROLES.ADMIN],
  verify_ticket: [ROLES.KETUA_PANITIA, ROLES.ADMIN],
};

export function canAccess(role: Role, resource: Resource): boolean {
  return PERMISSIONS[resource].includes(role);
}
```

Pakai di:
- Sidebar nav filter (hide Admin item kalau bukan admin).
- Action button visibility (mis. "+ Create event" hanya kalau `canAccess(user.role, RESOURCES.CREATE_EVENT)`).
- Proposal review controls (cek level vs role).

## Async Style

- Selalu `async/await`. **No** `.then() / .catch() / .finally()`.
- Pakai `try/catch` di service-like helpers; React layer biarkan TanStack Query handle.

## React 19

- `ref` sebagai prop (no `forwardRef`).
- Function component only.
- Hooks di top-level, no conditional calls.

## Accessibility

- Semantic HTML: `<button>`, `<a>`, `<nav>`, `<header>`, `<main>`, `<aside>`, list elements.
- `<label htmlFor>` untuk setiap input.
- Icon-only button → `aria-label`.
- Selected nav item → `aria-current="page"`.
- Modal/Dialog dari shadcn sudah handle `role="dialog"`, focus trap, esc-to-close.
- Status badge: label visible (not color-only).

## Commit Style

`<type>(<scope>): <subject>` lowercase, no period.

Types:
- `feat` — feature baru.
- `fix` — bug fix.
- `chore` — tooling/deps/typecheck.
- `docs` — dokumentasi.
- `refactor` — restructure tanpa behavior change.
- `style` — formatting.

Scope: `dashboard` untuk semua perubahan di `apps/dashboard`.

Footer: `https://claude.ai/code/session_01TWppFvDJ5iUy4rt7TU9eKu` (sesuai standard repo).

## Branch

Push ke `claude/loving-planck-4KveB`. Jangan rebase/force-push ke main.
