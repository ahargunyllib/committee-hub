import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const dashboardOverviewPath = "/dashboard/overview";

const getDashboardUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (typeof window === "undefined") {
    return normalizedPath;
  }

  return new URL(normalizedPath, window.location.origin).toString();
};

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
export const dashboardOverviewUrl = () =>
  getDashboardUrl(dashboardOverviewPath);

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>["data"]
>["user"];
