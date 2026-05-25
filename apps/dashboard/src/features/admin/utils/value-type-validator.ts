import type { ConfigValueType } from "@/shared/lib/types";

export function validateConfigValue(
  value: string,
  type: ConfigValueType
): string | null {
  if (type === "number" && Number.isNaN(Number(value))) {
    return "Must be a number";
  }
  if (type === "boolean" && value !== "true" && value !== "false") {
    return "Must be 'true' or 'false'";
  }
  if (type === "json") {
    try {
      JSON.parse(value);
    } catch {
      return "Must be valid JSON";
    }
  }
  return null;
}
