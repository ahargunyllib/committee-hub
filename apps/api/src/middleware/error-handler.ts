import { Elysia } from "elysia";
import { createErrorResponse, getErrorStatus } from "../lib/errors";
import { createId } from "../lib/id";
import { logger } from "../lib/logger";

export const errorHandlerPlugin = new Elysia({
  name: "error-handler",
})
  .onError(({ error, request, set }) => {
    const requestId =
      request.headers.get("x-request-id") ??
      request.headers.get("x-correlation-id") ??
      createId("req");

    const status = getErrorStatus(error);
    set.headers["x-request-id"] = requestId;
    set.status = status;

    if (status >= 500 && status !== 501) {
      logger.error({ error, requestId }, "Request failed");
    }

    return createErrorResponse(error, requestId);
  })
  .as("global");
