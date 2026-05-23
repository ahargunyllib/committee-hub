import { Elysia } from "elysia";
import { createId } from "../lib/id";
import { createRequestLogger } from "../lib/logger";

export const requestContextPlugin = new Elysia({
  name: "request-context",
}).derive(({ request, set }) => {
  const requestId = request.headers.get("x-request-id") ?? createId("req");
  set.headers["x-request-id"] = requestId;

  return {
    requestId,
    requestLogger: createRequestLogger(requestId),
  };
});
