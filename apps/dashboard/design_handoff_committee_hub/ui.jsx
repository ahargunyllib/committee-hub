// UI primitives — Badge, Button, Card, Input, Select, Avatar, EmptyState, Segmented.
// Exported on window so all Babel scripts share scope.

const { useState, useMemo, useEffect, useRef, useCallback } = React;
const { ROLE_LABELS } = window.DATA;

// ───────────────────────── Badge ─────────────────────────

function Badge({ kind, children, dot = false, className = "", ...rest }) {
  return (
    <span className={`badge ${kind || ""} ${className}`} {...rest}>
      {dot ? <span className="dot" /> : null}
      {children}
    </span>
  );
}

const STATUS_LABEL = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  revision_requested: "Revision",
  accepted: "Accepted",
  internal: "Internal",
  external: "External",
};
function StatusBadge({ status, dot = true }) {
  const kind = status === "revision_requested" ? "revision" : status;
  return (
    <Badge dot={dot} kind={kind}>
      {STATUS_LABEL[status] || status}
    </Badge>
  );
}
function RoleBadge({ role }) {
  return (
    <Badge className={`role is-${role}`}>{ROLE_LABELS[role] || role}</Badge>
  );
}

// ───────────────────────── Button ─────────────────────────

function Button({
  variant = "default", // default | primary | subtle | danger | success
  size = "md", // md | sm
  icon: IconComp,
  iconOnly = false,
  children,
  className = "",
  type = "button",
  ...rest
}) {
  const cls = [
    "btn",
    variant === "default" ? "" : variant,
    size === "sm" ? "sm" : "",
    iconOnly ? "icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} type={type} {...rest}>
      {IconComp ? <IconComp size={size === "sm" ? 13 : 15} /> : null}
      {iconOnly ? null : children}
    </button>
  );
}

// ───────────────────────── Card ─────────────────────────

function Card({
  title,
  subtitle,
  action,
  children,
  footer,
  className = "",
  bodyClass = "",
  flat = false,
}) {
  return (
    <section className={`card ${flat ? "flat" : ""} ${className}`}>
      {(title || action) && (
        <header className="card-head">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <div className="sub">{subtitle}</div> : null}
          </div>
          {action ? <div className="row tight">{action}</div> : null}
        </header>
      )}
      <div className={`card-body ${bodyClass}`}>{children}</div>
      {footer ? <footer className="card-foot">{footer}</footer> : null}
    </section>
  );
}

// ───────────────────────── Inputs ─────────────────────────

function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  className = "",
}) {
  return (
    <div className={`field ${error ? "has-error" : ""} ${className}`}>
      {label ? (
        <label htmlFor={htmlFor}>
          {label}
          {required ? <span className="req">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <div className="err">{error}</div>
      ) : hint ? (
        <div className="hint">{hint}</div>
      ) : null}
    </div>
  );
}

function Input({ icon: IconComp, className = "", ...rest }) {
  if (IconComp) {
    return (
      <div className="input-with-icon">
        <IconComp size={14} />
        <input className={`input ${className}`} {...rest} />
      </div>
    );
  }
  return <input className={`input ${className}`} {...rest} />;
}

function Textarea({ className = "", ...rest }) {
  return <textarea className={`textarea ${className}`} {...rest} />;
}

function Select({ children, className = "", ...rest }) {
  return (
    <select className={`select ${className}`} {...rest}>
      {children}
    </select>
  );
}

// ───────────────────────── Avatar ─────────────────────────

const AVATAR_HUES = [
  "#fce7d2",
  "#dbeafe",
  "#dcfce7",
  "#fae8ff",
  "#fee2e2",
  "#e0e7ff",
  "#fef3c7",
  "#cffafe",
];
function avatarColor(id) {
  let h = 0;
  for (let i = 0; i < (id || "").length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_HUES[h % AVATAR_HUES.length];
}
function Avatar({ user, size = "md" }) {
  const cls =
    size === "lg" ? "avatar lg" : size === "sm" ? "avatar sm" : "avatar";
  if (!user) {
    return <span className={cls}>—</span>;
  }
  const initials =
    user.image ||
    (user.name || "")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("");
  return (
    <span
      className={cls}
      style={{
        background: avatarColor(user.id),
        color: "#3a3a3f",
        borderColor: "transparent",
      }}
      title={user.name}
    >
      {initials}
    </span>
  );
}

// ───────────────────────── Segmented ─────────────────────────

function Segmented({ value, onChange, options }) {
  return (
    <div className="seg" role="tablist">
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.value;
        const l = typeof opt === "string" ? opt : opt.label;
        return (
          <button
            aria-selected={value === v}
            className={value === v ? "is-active" : ""}
            key={v}
            onClick={() => onChange(v)}
            role="tab"
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

// ───────────────────────── EmptyState ─────────────────────────

function EmptyState({ icon: IconComp, title, desc, action }) {
  return (
    <div className="empty">
      {IconComp ? (
        <div className="icon-wrap">
          <IconComp size={20} />
        </div>
      ) : null}
      <div className="title">{title}</div>
      {desc ? <div className="desc">{desc}</div> : null}
      {action ? <div style={{ marginTop: 10 }}>{action}</div> : null}
    </div>
  );
}

// ───────────────────────── Toast (inline) ─────────────────────────

function Toast({ children, kind = "info" }) {
  return (
    <div
      className={`badge ${kind === "success" ? "approved" : kind === "error" ? "rejected" : ""}`}
      style={{ height: 28, padding: "0 10px" }}
    >
      <span className="dot" />
      {children}
    </div>
  );
}

// ───────────────────────── Pretty date helpers ─────────────────────────

function fmtNice(iso) {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  if (isNaN(d)) {
    return iso;
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function fmtRel(iso) {
  if (!iso) {
    return "";
  }
  const d = new Date(iso);
  const today = window.DATA.today;
  const diff = Math.round((d - today) / 86_400_000);
  if (diff === 0) {
    return "today";
  }
  if (diff === 1) {
    return "tomorrow";
  }
  if (diff === -1) {
    return "yesterday";
  }
  if (diff > 0 && diff < 30) {
    return `in ${diff}d`;
  }
  if (diff < 0 && diff > -30) {
    return `${-diff}d ago`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

Object.assign(window, {
  Badge,
  StatusBadge,
  RoleBadge,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Avatar,
  Segmented,
  EmptyState,
  Toast,
  fmtNice,
  fmtRel,
});
