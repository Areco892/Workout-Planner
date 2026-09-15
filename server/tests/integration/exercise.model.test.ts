import type { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closeTestDatabase, resetTestDatabase, setupTestDatabase, testDatabaseUrl } from "./database";

const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

describeWithDatabase("exercise model integration", () => {
  let pool: Pool;
  let ExerciseModel: typeof import("../../src/models/exercise.model");

  beforeAll(async () => {
    pool = await setupTestDatabase();
    ExerciseModel = await import("../../src/models/exercise.model");
  });

  beforeEach(async () => {
    await resetTestDatabase(pool);
    await pool.query(
      `INSERT INTO exercise (name, image, target, difficulty)
       VALUES
         ('Chest Press', 'img/chest-press.webp', 'Chest', 'Beginner'),
         ('Chest Fly', 'img/chest-fly.webp', 'Chest', 'Intermediate'),
         ('Deadlift', 'img/deadlift.webp', 'Back', 'Advanced')`,
    );
  });

  afterAll(async () => {
    await closeTestDatabase(pool);
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
      1,
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
    await ExerciseModel.deleteExercise(1);

    const result = await pool.query("SELECT 1 FROM exercise WHERE eid = 1");
    expect(result.rowCount).toBe(0);
  });

  it("adds an exercise to a workout", async () => {
    const workout = await pool.query(
      "INSERT INTO workout (name) VALUES ('Push Day') RETURNING wid",
    );

    await ExerciseModel.addExercise(
      workout.rows[0].wid,
      1,
      4,
      135,
      8,
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
