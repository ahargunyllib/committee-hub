import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import { schema } from "./schema";

export const postgresClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === "test" ? 1 : 10,
});

export const db = drizzle(postgresClient, {
  schema,
  casing: "snake_case",
});

export type DB = typeof db;
