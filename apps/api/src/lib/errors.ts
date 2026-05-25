export const ErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  CONFLICT: "CONFLICT",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  NOT_FOUND: "NOT_FOUND",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

const errorStatus = {
  BAD_REQUEST: 400,
  CONFLICT: 409,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  NOT_IMPLEMENTED: 501,
  UNAUTHORIZED: 401,
} as const satisfies Record<ErrorCode, number>;

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;
  readonly status: number;

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      cause?: Error;
      details?: Record<string, unknown>;
    }
  ) {
    super(message, { cause: options?.cause });
    this.code = code;
    this.details = options?.details;
    this.status = errorStatus[code];
  }
}

type ErrorRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ErrorRecord =>
  typeof value === "object" && value !== null;

const isHttpStatus = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 400 &&
  value <= 599;

const getStringProperty = (value: ErrorRecord, key: string): string | null => {
  const property = value[key];
  return typeof property === "string" && property.length > 0 ? property : null;
};

const parseJsonObject = (value: string): ErrorRecord | null => {
  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const getHttpErrorStatus = (error: unknown): number | null => {
  if (!isRecord(error)) {
    return null;
  }

  const status = error.status;
  return isHttpStatus(status) ? status : null;
};

const getHttpErrorCode = (error: ErrorRecord, status: number): string => {
  const code = getStringProperty(error, "code");

  if (code) {
    return code;
  }

  if (status === 404) {
    return ErrorCode.NOT_FOUND;
  }

  if (status === 401) {
    return ErrorCode.UNAUTHORIZED;
  }

  if (status === 403) {
    return ErrorCode.FORBIDDEN;
  }

  if (status === 409) {
    return ErrorCode.CONFLICT;
  }

  return status >= 500
    ? ErrorCode.INTERNAL_SERVER_ERROR
    : ErrorCode.BAD_REQUEST;
};

const getValidationMessage = (error: ErrorRecord): string => {
  const type = getStringProperty(error, "type");
  const parsedMessage = getStringProperty(error, "message");
  const parsed = parsedMessage ? parseJsonObject(parsedMessage) : null;
  const validationTarget = type ?? getStringProperty(parsed ?? {}, "on");

  if (validationTarget) {
    return `Request ${validationTarget} validation failed`;
  }

  return "Request validation failed";
};

const getHttpErrorMessage = (
  error: ErrorRecord,
  code: string,
  status: number
): string => {
  if (status >= 500) {
    return "Internal server error";
  }

  if (code === "VALIDATION") {
    return getValidationMessage(error);
  }

  if (code === "PARSE") {
    return "Request body is not valid JSON";
  }

  if (code === "NOT_FOUND") {
    return "Resource not found";
  }

  return getStringProperty(error, "message") ?? "Request failed";
};

export const createErrorResponse = (
  error: unknown,
  requestId: string
): {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
  };
} => {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      },
    };
  }

  if (isRecord(error)) {
    const status = getHttpErrorStatus(error);

    if (status) {
      const code = getHttpErrorCode(error, status);

      return {
        error: {
          code,
          message: getHttpErrorMessage(error, code, status),
          requestId,
        },
      };
    }
  }

  return {
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      requestId,
    },
  };
};

export const getErrorStatus = (error: unknown): number => {
  if (error instanceof AppError) {
    return error.status;
  }

  const httpStatus = getHttpErrorStatus(error);

  if (httpStatus) {
    return httpStatus;
  }

  return errorStatus.INTERNAL_SERVER_ERROR;
};
