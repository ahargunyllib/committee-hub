# 01 — Foundation (Phases 0-2)

## Phase 0 — Install Dependencies + shadcn Primitives

### Goal

Pasang semua dep yang belum ada dan generate shadcn UI components yang akan dipakai. Setup env file.

### Prerequisites

- Repo cloned, working tree clean, di branch `claude/loving-planck-4KveB`.
- Bun terinstall.

### Tasks

#### 0.1 Install runtime deps

```bash
cd /home/user/committee-hub/apps/dashboard
bun add @tanstack/react-query @tanstack/react-query-devtools @tanstack/react-form zod better-auth sonner zustand
```

#### 0.2 Generate shadcn UI primitives

> Note: `components.json` style adalah `radix-mira`. Jika ada konflik, fallback ke `default`.

```bash
cd /home/user/committee-hub/apps/dashboard
bunx shadcn@latest add button card input textarea select dialog dropdown-menu tabs table sidebar avatar badge separator skeleton sonner tooltip label form scroll-area popover toggle-group alert
```

Ini akan generate `src/components/ui/*` (atau lokasi sesuai alias `components.json`).

#### 0.3 Buat env file

`apps/dashboard/.env.example`:

```
VITE_API_URL=http://localhost:3000
```

Salin ke `.env` (local, di-gitignore):

```bash
cp apps/dashboard/.env.example apps/dashboard/.env
```

#### 0.4 Typecheck

```bash
bun --cwd apps/dashboard run build  # atau bun typecheck di root
```

Pastikan tidak ada compile error baru.

### Acceptance Criteria

- `package.json` ada deps baru.
- `src/components/ui/` ada file: button, card, input, textarea, select, dialog, dropdown-menu, tabs, table, sidebar, avatar, badge, separator, skeleton, sonner, tooltip, label, form, scroll-area, popover, toggle-group, alert.
- `.env.example` ada.
- `bun --cwd apps/dashboard run build` tidak error.

### Commit

```
chore(dashboard): install shadcn primitives + query/form deps
```

---

## Phase 1 — Shared Lib

### Goal

Buat fondasi shared library: API client, auth client, query client, permissions, formatters.

### Prerequisites

Phase 0 done.

### Files to Create

#### `src/shared/lib/api.ts`

```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
  requestId?: string;

  constructor(args: {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
    requestId?: string;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.code = args.code;
    this.status = args.status;
    this.details = args.details;
    this.requestId = args.requestId;
  }
}

type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId?: string;
  };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let payload: ErrorEnvelope | null = null;
    try {
      payload = (await response.json()) as ErrorEnvelope;
    } catch {
      // ignore JSON parse failure
    }
    throw new ApiError({
      code: payload?.error.code ?? "UNKNOWN",
      message: payload?.error.message ?? response.statusText,
      status: response.status,
      details: payload?.error.details,
      requestId: payload?.error.requestId,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) => {
    const query = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== "")
            .map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : "";
    return request<T>(`${path}${query}`);
  },
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
```

#### `src/shared/lib/auth.ts`

```ts
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: { credentials: "include" },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: true,
          input: false,
        },
      },
    }),
  ],
});

export const { useSession, signIn, signOut, getSession } = authClient;

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>["data"]
>["user"];
```

> Lihat better-auth docs: https://www.better-auth.com/docs/client/react. Plugin `inferAdditionalFields` supaya `user.role` ter-type. Kalau API export `Auth` type, bisa juga pakai `inferAdditionalFields<typeof auth>()`.

#### `src/shared/lib/query-client.ts`

```ts
import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
```

#### `src/shared/lib/permissions.ts`

Lihat full snippet di [conventions.md](./conventions.md#permissions-helper).

#### `src/shared/lib/format.ts`

```ts
const LOCALE = "id-ID";

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const RELATIVE = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

export function formatRelative(value: string | Date): string {
  const now = Date.now();
  const target = new Date(value).getTime();
  const diff = Math.round((target - now) / 1000);
  for (const [unit, secs] of UNITS) {
    if (Math.abs(diff) >= secs || unit === "second") {
      return RELATIVE.format(Math.round(diff / secs), unit);
    }
  }
  return RELATIVE.format(0, "second");
}

export function formatDateChip(value: string | Date): { month: string; day: string } {
  const date = new Date(value);
  return {
    month: new Intl.DateTimeFormat(LOCALE, { month: "short" }).format(date).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
  };
}
```

#### `src/shared/lib/string.ts`

Lihat snippet di [design-tokens.md](./design-tokens.md#avatar-hash-hue).

### Acceptance Criteria

- File-file di `src/shared/lib/` ada dan terkompilasi.
- `bun --cwd apps/dashboard run build` sukses.

### Commit

```
feat(dashboard): add api client, auth client, query client, permissions, formatters
```

---

## Phase 2 — Status Color Tokens

### Goal

Tambahkan CSS variables untuk status & event type badges di `index.css`. Tidak ubah token yang sudah ada.

### Prerequisites

Phase 0-1 done.

### Tasks

Edit `src/index.css`:

1. Tambahkan blok CSS variables baru di `:root` (light theme) — lihat [design-tokens.md](./design-tokens.md#status-colors-tambahkan).
2. (Optional) Tambahkan untuk `.dark` jika dark theme dipakai.
3. Tambahkan mapping di `@theme inline` agar tersedia sebagai Tailwind utility classes (`bg-status-pending-bg`, dll).

### Acceptance Criteria

- `index.css` punya 8 status/type color groups, masing-masing dengan bg/fg/border.
- Tailwind utility `bg-status-success-bg text-status-success-fg border-status-success-border` works (test sederhana di salah satu route).

### Commit

```
feat(dashboard): add status badge color tokens
```
