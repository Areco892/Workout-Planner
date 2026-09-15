import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.test", quiet: true, override: true });

function resolveTestDatabaseUrl(): string | undefined {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  if (!process.env.DATABASE_URL) return undefined;

  const url = new URL(process.env.DATABASE_URL);
  if (!["localhost", "127.0.0.1"].includes(url.hostname)) return undefined;
  url.pathname = `${url.pathname}_test`;
  return url.toString();
}

export const testDatabaseUrl = resolveTestDatabaseUrl();

export async function setupTestDatabase(): Promise<Pool> {
  if (!testDatabaseUrl || !new URL(testDatabaseUrl).pathname.endsWith("_test")) {
    throw new Error("Integration tests require a database whose name ends in `_test`.");
  }

  process.env.DATABASE_URL = testDatabaseUrl;
  const pool = new Pool({
    connectionString: testDatabaseUrl,
    ssl: process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    await pool.query("DROP TABLE IF EXISTS workout_exercise, workout, exercise CASCADE");
    const migration = await fs.readFile(
      path.resolve("db/migrations/001_initial_schema.sql"),
      "utf8",
    );
    await pool.query(migration);
    return pool;
  } catch (error) {
    await pool.end();
    throw error;
  }
}

export async function resetTestDatabase(pool: Pool): Promise<void> {
  await pool.query(
    "TRUNCATE TABLE workout_exercise, workout, exercise RESTART IDENTITY CASCADE",
  );
}

export async function closeTestDatabase(pool: Pool | undefined): Promise<void> {
  if (!pool) return;
  const database = await import("../../src/db");
  await database.pool.end();
  await pool.end();
}
