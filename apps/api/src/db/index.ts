import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "cloudflare:workers";
import { schema } from "./schema";

export const postgresClient = postgres(env.HYPERDRIVE.connectionString, {
  fetch_types: false,
  max: env.NODE_ENV === "production" ? 5 : 1,
});

export const db = drizzle(postgresClient, {
  schema,
  casing: "snake_case",
});

export type DB = typeof db;
