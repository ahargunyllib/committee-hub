type ErrorRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ErrorRecord =>
  typeof value === "object" && value !== null;

const getStringProperty = (value: ErrorRecord, key: string): string | null => {
  const property = value[key];
  return typeof property === "string" && property.length > 0 ? property : null;
};

const toErrorMessage = (error: unknown): string | null => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (isRecord(error)) {
    const directMessage =
      getStringProperty(error, "message") ??
      getStringProperty(error, "summary") ??
      getStringProperty(error, "problem");

    if (directMessage) {
      return directMessage;
    }

    if (Array.isArray(error.issues)) {
      return formatFormErrors(error.issues);
    }

    if (Array.isArray(error.errors)) {
      return formatFormErrors(error.errors);
    }

    return null;
  }

  if (error === null || error === undefined) {
    return null;
  }

  return String(error);
};

export const formatFormErrors = (errors: readonly unknown[]): string | null => {
  const messages = errors
    .map((error) => toErrorMessage(error))
    .filter((message): message is string => Boolean(message));

  if (messages.length === 0) {
    return null;
  }

  return [...new Set(messages)].join(", ");
};
