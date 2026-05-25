import { Elysia } from "elysia";
import type { SessionAuth } from "../lib/auth";

export const createAuthContextPlugin = (auth: SessionAuth) =>
  new Elysia({
    name: "auth-context",
  }).derive(async ({ request }) => ({
    authSession: await auth.api.getSession({
      headers: request.headers,
    }),
  }));
