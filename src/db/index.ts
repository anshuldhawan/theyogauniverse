import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Neon Postgres via the serverless HTTP driver (Vercel-native). Only
 * available when DATABASE_URL is set; in development the app runs against
 * the in-memory seed repository instead (src/lib/repo).
 */
export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let cached: ReturnType<typeof create> | null = null;

function create() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

export function db() {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is not set — the db() client is unavailable.");
  }
  cached ??= create();
  return cached;
}

export { schema };
