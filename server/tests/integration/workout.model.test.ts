import type { Pool } from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closeTestDatabase, resetTestDatabase, setupTestDatabase, testDatabaseUrl } from "./database";

const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

describeWithDatabase("workout database integration", () => {
  let pool: Pool;
  let model: typeof import("../../src/models/workout.model");
  let service: typeof import("../../src/services/workout.service");
  let app: typeof import("../../src/app").default;

  beforeAll(async () => {
    pool = await setupTestDatabase();
    model = await import("../../src/models/workout.model");
    service = await import("../../src/services/workout.service");
    app = (await import("../../src/app")).default;
  });

  beforeEach(async () => {
    await resetTestDatabase(pool);
    await pool.query(
      `INSERT INTO exercise (name, image, target, difficulty) VALUES
       ('Chest Press', 'img/chest-press.webp', 'Chest', 'Beginner'),
       ('Chest Fly', 'img/chest-fly.webp', 'Chest', 'Intermediate')`,
    );
  });

  afterAll(async () => {
    await closeTestDatabase(pool);
  });

  async function addPrescription(workoutId: number, exerciseId = 1) {
    await pool.query(
      "INSERT INTO workout_exercise (wid, eid, sets, reps, weight) VALUES ($1, $2, 3, 10, 25)",
      [workoutId, exerciseId],
    );
  }

  it("creates a workout with generated metadata", async () => {
    const workout = await model.createWorkout("Push Day");
    expect(workout).toMatchObject({ wid: 1, name: "Push Day", duration: null });
    expect(workout.created_at).toBeInstanceOf(Date);
    const saved = await pool.query("SELECT name FROM workout WHERE wid = $1", [workout.wid]);
    expect(saved.rows[0].name).toBe("Push Day");
  });

  it("lists workouts in creation order", async () => {
    await pool.query(
      `INSERT INTO workout (name, created_at) VALUES
       ('Later', '2026-02-01'), ('Earlier', '2026-01-01')`,
    );
    expect((await model.getWorkouts()).map((workout) => workout.name))
      .toEqual(["Earlier", "Later"]);
  });

  it("renames a workout without changing its exercises", async () => {
    const workout = await model.createWorkout("Push Day");
    await addPrescription(workout.wid);
    expect(await model.updateWorkout(workout.wid, "Chest Day")).toBe(true);
    expect((await model.getWorkouts())[0].name).toBe("Chest Day");
    expect(await model.getExercises(workout.wid)).toHaveLength(1);
  });

  it("deletes a workout without deleting other workouts", async () => {
    const first = await model.createWorkout("Push Day");
    const second = await model.createWorkout("Pull Day");
    expect(await model.deleteWorkout(first.wid)).toBe(true);
    expect((await model.getWorkouts()).map((workout) => workout.wid)).toEqual([second.wid]);
  });

  it("retrieves exercise details and prescriptions only for the selected workout", async () => {
    const first = await model.createWorkout("Push Day");
    const second = await model.createWorkout("Other Day");
    await addPrescription(first.wid);
    await addPrescription(second.wid, 2);
    expect(await model.getExercises(first.wid)).toEqual([{
      eid: 1, name: "Chest Press", image: "img/chest-press.webp",
      target: "Chest", difficulty: "Beginner", sets: 3, reps: 10, weight: 25,
    }]);
  });

  it("returns an empty list for an existing empty workout", async () => {
    const workout = await model.createWorkout("Empty Day");
    expect(await service.getExercisesService(workout.wid)).toEqual([]);
  });

  it("returns null at the model layer for a missing workout", async () => {
    expect(await model.getExercises(999)).toBeNull();
  });

  it("removes an exercise only from the requested workout", async () => {
    const first = await model.createWorkout("Push Day");
    const second = await model.createWorkout("Other Day");
    await addPrescription(first.wid);
    await addPrescription(second.wid);
    expect(await model.deleteExercise(first.wid, 1)).toBe(true);
    expect(await model.getExercises(first.wid)).toEqual([]);
    expect(await model.getExercises(second.wid)).toHaveLength(1);
    expect((await pool.query("SELECT 1 FROM exercise WHERE eid = 1")).rowCount).toBe(1);
  });

  it("cascades workout deletion to associations but preserves the exercise catalog", async () => {
    const workout = await model.createWorkout("Push Day");
    await addPrescription(workout.wid);
    await model.deleteWorkout(workout.wid);
    expect((await pool.query("SELECT 1 FROM workout_exercise")).rowCount).toBe(0);
    expect((await pool.query("SELECT 1 FROM exercise")).rowCount).toBe(2);
  });

  it.each(["update", "delete"])("returns false when trying to %s a missing workout", async (operation) => {
    const result = operation === "update"
      ? await model.updateWorkout(999, "Missing")
      : await model.deleteWorkout(999);
    expect(result).toBe(false);
  });

  it.each(["get", "update", "delete"])("maps a missing workout to a typed 404 during %s", async (operation) => {
    const action = operation === "get"
      ? service.getExercisesService(999)
      : operation === "update"
        ? service.updateWorkoutService(999, "Missing")
        : service.deleteWorkoutService(999);
    await expect(action).rejects.toMatchObject({ status: 404, code: "WORKOUT_NOT_FOUND" });
  });

  it("maps a missing workout-exercise association to a typed 404", async () => {
    const workout = await model.createWorkout("Empty Day");
    await expect(service.deleteExerciseService(workout.wid, 1)).rejects.toMatchObject({
      status: 404, code: "WORKOUT_EXERCISE_NOT_FOUND",
    });
  });

  it("completes the real HTTP create → add → read → rename → remove → delete flow", async () => {
    const created = await request(app).post("/workouts").send({ name: "Smoke Test" }).expect(201);
    const id = created.body.wid;
    await request(app).post("/exercises/add")
      .send({ wid: id, eid: 1, sets: 3, reps: 10, weight: 25 }).expect(200);
    const exercises = await request(app).get(`/workouts/${id}`).expect(200);
    expect(exercises.body[0]).toMatchObject({ eid: 1, sets: 3, reps: 10, weight: 25 });
    await request(app).put(`/workouts/${id}`).send({ name: "Renamed" }).expect(200);
    const listed = await request(app).get("/workouts").expect(200);
    expect(listed.body[0].name).toBe("Renamed");
    await request(app).delete(`/workouts/${id}/exercises/1`).expect(200);
    const empty = await request(app).get(`/workouts/${id}`).expect(200);
    expect(empty.body).toEqual([]);
    await request(app).delete(`/workouts/${id}`).expect(200);
    await request(app).get(`/workouts/${id}`).expect(404);
  });
});
