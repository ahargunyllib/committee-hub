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

  return errorStatus.INTERNAL_SERVER_ERROR;
};
