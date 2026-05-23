import { Elysia } from "elysia";
import { auth } from "../lib/auth";

export const authContextPlugin = new Elysia({
  name: "auth-context",
}).derive(async ({ request }) => ({
  authSession: await auth.api.getSession({
    headers: request.headers,
  }),
}));
