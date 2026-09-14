import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.test", quiet: true, override: true });

function resolveTestDatabaseUrl(): string | undefined {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }

  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  const developmentUrl = new URL(process.env.DATABASE_URL);
  if (!["localhost", "127.0.0.1"].includes(developmentUrl.hostname)) {
    return undefined;
  }

  const databaseName = developmentUrl.pathname.slice(1);
  developmentUrl.pathname = `/${databaseName}_test`;
  return developmentUrl.toString();
}

const testDatabaseUrl = resolveTestDatabaseUrl();
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

function assertSafeTestDatabase(connectionString: string): void {
  const databaseName = new URL(connectionString).pathname.slice(1);

  if (!databaseName.endsWith("_test")) {
    throw new Error(
      "Integration tests require a database whose name ends in `_test`.",
    );
  }
}

describeWithDatabase("exercise model integration", () => {
  let pool: Pool;
  let ExerciseModel: typeof import("../../src/models/exercise.model");

  beforeAll(async () => {
    assertSafeTestDatabase(testDatabaseUrl!);
    process.env.DATABASE_URL = testDatabaseUrl;

    pool = new Pool({
      connectionString: testDatabaseUrl,
      ssl: process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
    });

    await pool.query(
      "DROP TABLE IF EXISTS workout_exercise, workout, exercise CASCADE",
    );
    const migrationPath = path.resolve(
      process.cwd(),
      "db/migrations/001_initial_schema.sql",
    );
    const migration = await fs.readFile(migrationPath, "utf8");
    await pool.query(migration);

    ExerciseModel = await import("../../src/models/exercise.model");
  });

  beforeEach(async () => {
    await pool.query(
      "TRUNCATE TABLE workout_exercise, workout, exercise RESTART IDENTITY CASCADE",
    );
    await pool.query(
      `INSERT INTO exercise (name, image, target, difficulty)
       VALUES
         ('Chest Press', 'img/chest-press.webp', 'Chest', 'Beginner'),
         ('Chest Fly', 'img/chest-fly.webp', 'Chest', 'Intermediate'),
         ('Deadlift', 'img/deadlift.webp', 'Back', 'Advanced')`,
    );
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  it.each([
    ["All", "All", ["Chest Press", "Chest Fly", "Deadlift"]],
    ["Beginner", "All", ["Chest Press"]],
    ["All", "Chest", ["Chest Press", "Chest Fly"]],
    ["Advanced", "Back", ["Deadlift"]],
  ])(
    "filters exercises with difficulty %s and target %s",
    async (difficulty, target, expectedNames) => {
      const exercises = await ExerciseModel.getExercises(difficulty, target);

      expect(exercises.map((exercise) => exercise.name)).toEqual(expectedNames);
    },
  );

  it("creates an exercise", async () => {
    const result = await ExerciseModel.createExercise(
      "Lateral Raise",
      "img/lateral-raises.webp",
      "Shoulders",
      "Beginner",
    );

    expect(result.rows[0]).toMatchObject({
      name: "Lateral Raise",
      target: "Shoulders",
      difficulty: "Beginner",
    });
  });

  it("updates an exercise", async () => {
    await ExerciseModel.updateExercise(
      "1",
      "Incline Chest Press",
      "img/chest-press.webp",
      "Chest",
      "Intermediate",
    );

    const result = await pool.query(
      "SELECT name, difficulty FROM exercise WHERE eid = 1",
    );
    expect(result.rows[0]).toEqual({
      name: "Incline Chest Press",
      difficulty: "Intermediate",
    });
  });

  it("deletes an exercise", async () => {
    await ExerciseModel.deleteExercise("1");

    const result = await pool.query("SELECT 1 FROM exercise WHERE eid = 1");
    expect(result.rowCount).toBe(0);
  });

  it("adds an exercise to a workout", async () => {
    const workout = await pool.query(
      "INSERT INTO workout (name) VALUES ('Push Day') RETURNING wid",
    );

    await ExerciseModel.addExercise(
      String(workout.rows[0].wid),
      "1",
      "4",
      "135",
      "8",
    );

    const result = await pool.query(
      "SELECT wid, eid, sets, weight, reps FROM workout_exercise",
    );
    expect(result.rows[0]).toMatchObject({
      wid: workout.rows[0].wid,
      eid: 1,
      sets: 4,
      weight: 135,
      reps: 8,
    });
  });

  it("rejects duplicate exercise names", async () => {
    await expect(
      ExerciseModel.createExercise(
        "Chest Press",
        "img/chest-press.webp",
        "Chest",
        "Beginner",
      ),
    ).rejects.toMatchObject({ code: "23505" });
  });
});
