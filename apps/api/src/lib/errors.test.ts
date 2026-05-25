import { describe, expect, test } from "bun:test";
import { createErrorResponse, getErrorStatus } from "./errors";

describe("error helpers", () => {
  test("preserves Elysia validation status and returns a stable message", () => {
    const error = {
      code: "VALIDATION",
      message: JSON.stringify({
        found: {},
        on: "body",
        type: "validation",
      }),
      status: 422,
    };

    expect(getErrorStatus(error)).toBe(422);
    expect(createErrorResponse(error, "req_1")).toEqual({
      error: {
        code: "VALIDATION",
        message: "Request body validation failed",
        requestId: "req_1",
      },
    });
  });

  test("maps Elysia parse errors to bad request responses", () => {
    const error = {
      code: "PARSE",
      message: "Bad Request",
      status: 400,
    };

    expect(getErrorStatus(error)).toBe(400);
    expect(createErrorResponse(error, "req_2")).toEqual({
      error: {
        code: "PARSE",
        message: "Request body is not valid JSON",
        requestId: "req_2",
      },
    });
  });
});
