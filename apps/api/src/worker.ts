import { env as workerBindings } from "cloudflare:workers";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";

type HyperdriveBinding = {
  connectionString: string;
};

type ApiWorkerBindings = Env & {
  HYPERDRIVE?: HyperdriveBinding;
  PORT?: string;
};

const applyDefaultEnv = (key: string, value: string): void => {
  process.env[key] ??= value;
};

const applyWorkerBindings = (bindings: ApiWorkerBindings): void => {
  const databaseUrl =
    bindings.HYPERDRIVE?.connectionString ?? bindings.DATABASE_URL;

  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }

  process.env.BETTER_AUTH_SECRET = bindings.BETTER_AUTH_SECRET;
  process.env.BETTER_AUTH_URL = bindings.BETTER_AUTH_URL;
  process.env.DASHBOARD_URL = bindings.DASHBOARD_URL;
  process.env.GOOGLE_CLIENT_ID = bindings.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_SECRET = bindings.GOOGLE_CLIENT_SECRET;
  process.env.LOG_LEVEL = bindings.LOG_LEVEL;

  if (typeof bindings.PORT === "string") {
    process.env.PORT = bindings.PORT;
  }

  applyDefaultEnv("NODE_ENV", "production");
  applyDefaultEnv("LOG_LEVEL", "info");
  applyDefaultEnv("PORT", "3000");
};

applyWorkerBindings(workerBindings);

const { createApp } = await import("./app");

export default createApp(CloudflareAdapter).compile();
