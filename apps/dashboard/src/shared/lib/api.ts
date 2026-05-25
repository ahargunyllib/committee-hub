const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type RequestParams = Record<string, string | number | boolean | undefined>;

type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
    requestId?: string;
  };
};

export class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;
  requestId?: string;
  status: number;

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

const isJsonResponse = (response: Response): boolean => {
  const contentType = response.headers.get("content-type");
  return contentType?.includes("application/json") ?? false;
};

const parseErrorEnvelope = async (
  response: Response
): Promise<ErrorEnvelope | null> => {
  if (!isJsonResponse(response)) {
    return null;
  }

  try {
    return (await response.json()) as ErrorEnvelope;
  } catch {
    return null;
  }
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = await parseErrorEnvelope(response);
    throw new ApiError({
      code: payload?.error?.code ?? "UNKNOWN",
      message: payload?.error?.message ?? response.statusText,
      status: response.status,
      details: payload?.error?.details,
      requestId: payload?.error?.requestId,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!isJsonResponse(response)) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const toQueryString = (params?: RequestParams): string => {
  if (!params) {
    return "";
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

const toBody = (body?: unknown): string | undefined =>
  body === undefined ? undefined : JSON.stringify(body);

export const api = {
  get: <T>(path: string, params?: RequestParams): Promise<T> =>
    request<T>(`${path}${toQueryString(params)}`),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { body: toBody(body), method: "POST" }),
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { body: toBody(body), method: "PATCH" }),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { body: toBody(body), method: "PUT" }),
  del: <T>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }),
};
