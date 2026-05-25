import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db";
import {
  accountTable,
  sessionTable,
  userTable,
  verificationTable,
} from "../db/auth.schema";
import { createId } from "./id";
import { env } from "cloudflare:workers";

export const auth = betterAuth({
  appName: "committee-hub",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account: accountTable,
      session: sessionTable,
      user: userTable,
      verification: verificationTable,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: "mahasiswa",
          },
        }),
      },
    },
  },
  basePath: "/auth",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL, env.DASHBOARD_URL],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 3600,
    },
  },
  plugins: [openAPI()],
  user: {
    additionalFields: {
      role: {
        type: [
          "mahasiswa",
          "ketua_panitia",
          "ormawa",
          "fakultas",
          "universitas",
          "admin",
        ],
        defaultValue: "mahasiswa",
        input: false,
        required: true,
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    },
    database: {
      generateId: () => createId("auth"),
    },
  },
  experimental: {
    joins: true,
  },
});

export type Auth = typeof auth;
export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
