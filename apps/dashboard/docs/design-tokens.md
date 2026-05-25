# Design Tokens

Existing tokens dari `src/index.css` di-pertahankan (Space Grotesk + Manrope, yellow primary, OKLch color space). Hanya tambah **status colors** yang belum ada.

## Mapping Handoff → Existing

| Handoff token | Existing shadcn equivalent | Action |
|---|---|---|
| `--bg` (`#f7f7f8`) | `--background` | Keep existing |
| `--surface` (`#ffffff`) | `--card`, `--popover` | Keep existing |
| `--surface-2` (`#fafafb`) | `--muted` | Keep existing |
| `--border` (`#e7e7ea`) | `--border` | Keep existing |
| `--text` (`#18181b`) | `--foreground` | Keep existing |
| `--text-muted` (`#71717a`) | `--muted-foreground` | Keep existing |
| `--accent` (`#4f46e5` indigo) | `--primary` (yellow) | Keep existing (yellow) — beda dari handoff tapi sesuai brand existing |
| `--sidebar-bg` (`#fbfbfc`) | `--sidebar` | Keep existing |
| Font Geist | Space Grotesk + Manrope | Keep existing |

> Tidak ada perubahan pada token yang sudah ada. Hanya **tambah** status colors di section bawah.

## Status Colors (TAMBAHKAN)

Edit `src/index.css`. Tambahkan di `:root` (light theme):

```css
:root {
  /* ... existing tokens ... */

  /* Status: draft / closed */
  --status-draft-bg: #f4f4f5;
  --status-draft-fg: #52525b;
  --status-draft-border: #e4e4e7;

  /* Status: open / approved / accepted */
  --status-success-bg: #e7f6ee;
  --status-success-fg: #126b3a;
  --status-success-border: #c4e7d2;

  /* Status: pending */
  --status-pending-bg: #fff7e0;
  --status-pending-fg: #92590b;
  --status-pending-border: #f6e3a3;

  /* Status: rejected */
  --status-danger-bg: #fdecec;
  --status-danger-fg: #a02020;
  --status-danger-border: #f3c8c8;

  /* Status: revision_requested */
  --status-info-bg: #e6efff;
  --status-info-fg: #1d4ed8;
  --status-info-border: #c2d6f8;

  /* Event type: internal */
  --type-internal-bg: #eef2f7;
  --type-internal-fg: #334155;
  --type-internal-border: #dbe2eb;

  /* Event type: external */
  --type-external-bg: #f1ecff;
  --type-external-fg: #4c2bb8;
  --type-external-border: #ddd1ff;
}
```

Optional dark theme (mirror dengan opacity tweaks):

```css
.dark {
  /* ... existing dark tokens ... */
  --status-draft-bg: oklch(0.274 0.006 286.033);
  --status-draft-fg: oklch(0.705 0.015 286.067);
  --status-draft-border: oklch(0.35 0.006 286);
  /* ... dst, atau skip dark theme untuk v1 ... */
}
```

Register di `@theme inline` block supaya bisa dipakai sebagai Tailwind utility:

```css
@theme inline {
  /* ... existing ... */

  --color-status-draft-bg: var(--status-draft-bg);
  --color-status-draft-fg: var(--status-draft-fg);
  --color-status-draft-border: var(--status-draft-border);

  --color-status-success-bg: var(--status-success-bg);
  --color-status-success-fg: var(--status-success-fg);
  --color-status-success-border: var(--status-success-border);

  --color-status-pending-bg: var(--status-pending-bg);
  --color-status-pending-fg: var(--status-pending-fg);
  --color-status-pending-border: var(--status-pending-border);

  --color-status-danger-bg: var(--status-danger-bg);
  --color-status-danger-fg: var(--status-danger-fg);
  --color-status-danger-border: var(--status-danger-border);

  --color-status-info-bg: var(--status-info-bg);
  --color-status-info-fg: var(--status-info-fg);
  --color-status-info-border: var(--status-info-border);

  --color-type-internal-bg: var(--type-internal-bg);
  --color-type-internal-fg: var(--type-internal-fg);
  --color-type-internal-border: var(--type-internal-border);

  --color-type-external-bg: var(--type-external-bg);
  --color-type-external-fg: var(--type-external-fg);
  --color-type-external-border: var(--type-external-border);
}
```

Penggunaan di Tailwind: `bg-status-success-bg text-status-success-fg border-status-success-border`.

## Status → Variant Mapping

Helper di `features/<x>/utils/variant-mapper.ts`:

```ts
export type StatusVariant =
  | "draft"
  | "success"
  | "pending"
  | "danger"
  | "info";

export function eventStatusVariant(
  status: "draft" | "open" | "closed",
): StatusVariant {
  if (status === "open") return "success";
  if (status === "draft") return "draft";
  return "draft"; // closed → grey
}

export function proposalStatusVariant(
  status: "pending" | "approved" | "rejected" | "revision_requested",
): StatusVariant {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  if (status === "revision_requested") return "info";
  return "pending";
}

export function applicationStatusVariant(
  status: "pending" | "accepted" | "rejected",
): StatusVariant {
  if (status === "accepted") return "success";
  if (status === "rejected") return "danger";
  return "pending";
}
```

## Typography Scale

Pakai existing shadcn defaults + Tailwind utilities. Reference scale dari handoff (informational):

| Element | Tailwind |
|---|---|
| Page H1 | `text-2xl font-semibold tracking-tight` (~22px) |
| Section H3 / Card title | `text-sm font-semibold` (~13.5px) |
| Stat value | `text-3xl font-semibold tabular-nums tracking-tight` (~26px) |
| Body | `text-sm` (~14px) |
| Meta / muted | `text-xs text-muted-foreground` (~12.5-13px) |
| Eyebrow label | `text-[11px] font-medium uppercase tracking-wider text-muted-foreground` |

Untuk mono numerals (counters, dates, ids): `font-mono tabular-nums`. Kita pakai Manrope sebagai mono fallback atau import `@fontsource-variable/jetbrains-mono` jika perlu (optional, bisa skip dulu).

## Radius

Existing `--radius: 0.625rem` (10px). Tailwind utility:

| Token | Existing | Handoff |
|---|---|---|
| `rounded-sm` | calc(--radius * 0.6) = 6px | Button 6px |
| `rounded-md` | calc(--radius * 0.8) = 8px | Card 8px |
| `rounded-lg` | --radius = 10px | Modal 10px |
| `rounded-full` | 999px | Avatar |

Sesuai. Tidak perlu ubah.

## Shadow

Existing shadcn default sudah cukup. Untuk modal pakai `shadow-lg`. Untuk card optional `shadow-sm`.

## Density Toggle (skip untuk v1)

Handoff mention density toggle (comfortable ↔ dense). Skip untuk v1. Implementasi pakai padding `comfortable` saja (default Tailwind: card padding `p-6`, table row `h-14`).

## Avatar Hash Hue

Untuk colored avatar circles, hash user id ke 1-of-8 pastel hues:

```ts
// shared/lib/string.ts
const HUES = [210, 30, 130, 280, 350, 180, 60, 320] as const;

export function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return HUES[Math.abs(h) % HUES.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts.at(-1)![0]).toUpperCase();
}
```

Style inline: `style={{ backgroundColor: `oklch(0.92 0.05 ${hashHue(id)})` }}` foreground `#3a3a3f`.
