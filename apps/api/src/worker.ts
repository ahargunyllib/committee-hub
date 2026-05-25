import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { runWithBackgroundTaskRunner } from "./lib/background-tasks";

type HyperdriveBinding = {
  connectionString: string;
};

type ApiWorkerBindings = {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DASHBOARD_URL: string;
  DATABASE_URL?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  HYPERDRIVE?: HyperdriveBinding;
  LOG_LEVEL?: "info";
  NODE_ENV?: "production";
  PORT?: string;
};

type WorkerApp = {
  fetch: (request: Request) => Response | Promise<Response>;
};

let appPromise: Promise<WorkerApp> | undefined;

const applyEnv = (key: string, value: string): void => {
  process.env[key] = value;
};

const applyDefaultEnv = (key: string, value: string): void => {
  process.env[key] ??= value;
};

const applyWorkerBindings = (bindings: ApiWorkerBindings): void => {
  const databaseUrl =
    bindings.HYPERDRIVE?.connectionString ?? bindings.DATABASE_URL;

  if (databaseUrl) {
    applyEnv("DATABASE_URL", databaseUrl);
  }

  applyEnv("BETTER_AUTH_SECRET", bindings.BETTER_AUTH_SECRET);
  applyEnv("BETTER_AUTH_URL", bindings.BETTER_AUTH_URL);
  applyEnv("DASHBOARD_URL", bindings.DASHBOARD_URL);
  applyEnv("GOOGLE_CLIENT_ID", bindings.GOOGLE_CLIENT_ID);
  applyEnv("GOOGLE_CLIENT_SECRET", bindings.GOOGLE_CLIENT_SECRET);

  if (bindings.NODE_ENV) {
    applyEnv("NODE_ENV", bindings.NODE_ENV);
  }

  if (bindings.LOG_LEVEL) {
    applyEnv("LOG_LEVEL", bindings.LOG_LEVEL);
  }

  if (typeof bindings.PORT === "string") {
    applyEnv("PORT", bindings.PORT);
  }

  applyDefaultEnv("NODE_ENV", "production");
  applyDefaultEnv("LOG_LEVEL", "info");
  applyDefaultEnv("PORT", "3000");
};

const createWorkerApp = async (): Promise<WorkerApp> => {
  const { createApp } = await import("./app");
  return createApp(CloudflareAdapter).compile();
};

const getApp = async (bindings: ApiWorkerBindings): Promise<WorkerApp> => {
  applyWorkerBindings(bindings);

  appPromise ??= createWorkerApp();

  return await appPromise;
};

export default {
  async fetch(
    request: Request,
    bindings: ApiWorkerBindings,
    ctx: ExecutionContext
  ) {
    const app = await getApp(bindings);

    return runWithBackgroundTaskRunner(
      (promise) => ctx.waitUntil(promise),
      () => app.fetch(request)
    );
  },
};
