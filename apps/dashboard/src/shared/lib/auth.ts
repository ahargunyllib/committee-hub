import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: { credentials: "include" },
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          input: false,
          required: true,
          type: "string",
        },
      },
    }),
  ],
});

export const { getSession, signIn, signOut, useSession } = authClient;

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>["data"]
>["user"];
