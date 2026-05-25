import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema } from "./schema";

export const createDb = (url: string) => {
  const postgresClient = postgres(url, {
    fetch_types: false,
    max: 5,
  });

  const db = drizzle(postgresClient, {
    schema,
    casing: "snake_case",
  });

  return db;
};

export type DB = ReturnType<typeof createDb>;
