import { env as workerBindings } from "cloudflare:workers";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";

type HyperdriveBinding = {
  connectionString: string;
};

type ApiWorkerBindings = {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  DATABASE_URL?: string;
  DASHBOARD_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  HYPERDRIVE?: HyperdriveBinding;
  LOG_LEVEL?: string;
  NODE_ENV?: string;
  PORT?: string;
};

const workerEnvKeys = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "DASHBOARD_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "LOG_LEVEL",
  "NODE_ENV",
  "PORT",
] as const;

const applyDefaultEnv = (key: string, value: string): void => {
  process.env[key] ??= value;
};

const applyWorkerBindings = (bindings: ApiWorkerBindings): void => {
  const databaseUrl =
    bindings.HYPERDRIVE?.connectionString ?? bindings.DATABASE_URL;

  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }

  for (const key of workerEnvKeys) {
    const value = bindings[key];

    if (typeof value === "string") {
      process.env[key] = value;
    }
  }

  applyDefaultEnv("NODE_ENV", "production");
  applyDefaultEnv("LOG_LEVEL", "info");
  applyDefaultEnv("PORT", "3000");
};

applyWorkerBindings(workerBindings as ApiWorkerBindings);

const { createApp } = await import("./app");

export default createApp(CloudflareAdapter).compile();
