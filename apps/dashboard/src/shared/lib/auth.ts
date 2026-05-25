import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import {
  applyDevRoleOverride,
  getDevRoleOverride,
  useDevRoleOverride,
} from "@/shared/hooks/use-dev-role-override";

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

type SessionResult = Awaited<ReturnType<typeof authClient.getSession>>;
type UseSessionResult = ReturnType<typeof authClient.useSession>;

const withRoleOverride = <TSession extends { data: SessionResult["data"] }>(
  session: TSession,
  roleOverride = getDevRoleOverride()
): TSession =>
  session.data
    ? {
        ...session,
        data: {
          ...session.data,
          user: applyDevRoleOverride(session.data.user, roleOverride),
        },
      }
    : session;

export const getSession = async (
  ...args: Parameters<typeof authClient.getSession>
) => withRoleOverride(await authClient.getSession(...args));

export const useSession = (): UseSessionResult => {
  const roleOverride = useDevRoleOverride();
  const session = authClient.useSession();
  return withRoleOverride(session, roleOverride);
};

export const { signIn, signOut } = authClient;

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getSession>>["data"]
>["user"];
