const HUES = [210, 30, 130, 280, 350, 180, 60, 320] as const;
const WHITESPACE = /\s+/;

export const hashHue = (id: string): number => {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % Number.MAX_SAFE_INTEGER;
  }

  return HUES[Math.abs(hash) % HUES.length];
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(WHITESPACE).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const first = parts[0][0] ?? "";
  const last = parts.at(-1)?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
};

export const titleCase = (value: string): string =>
  value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
