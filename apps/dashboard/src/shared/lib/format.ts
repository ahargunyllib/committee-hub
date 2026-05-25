const LOCALE = "id-ID";

const RELATIVE = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

export const formatDate = (value: string | Date): string =>
  new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
  }).format(new Date(value));

export const formatDateTime = (value: string | Date): string =>
  new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatRelative = (value: string | Date): string => {
  const target = new Date(value).getTime();
  const diff = Math.round((target - Date.now()) / 1000);

  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diff) >= seconds || unit === "second") {
      return RELATIVE.format(Math.round(diff / seconds), unit);
    }
  }

  return RELATIVE.format(0, "second");
};

export const formatDateChip = (
  value: string | Date
): { month: string; day: string } => {
  const date = new Date(value);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: new Intl.DateTimeFormat(LOCALE, { month: "short" })
      .format(date)
      .toUpperCase(),
  };
};
