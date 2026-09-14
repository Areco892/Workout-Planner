import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
import { AppError } from "../src/errors/app-error";
import * as WorkoutService from "../src/services/workout.service";

vi.mock("../src/services/workout.service", () => ({
  getWorkoutsService: vi.fn(),
  getExercisesService: vi.fn(),
  createWorkoutService: vi.fn(),
  updateWorkoutService: vi.fn(),
  deleteWorkoutService: vi.fn(),
  deleteExerciseService: vi.fn(),
}));

describe("workout routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /workouts returns workout plans", async () => {
    const workouts = [{ wid: 1, name: "Push Day" }];
    vi.mocked(WorkoutService.getWorkoutsService).mockResolvedValue(workouts);

    const response = await request(app).get("/workouts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(workouts);
  });

  it("GET /workouts/:id returns workout exercises", async () => {
    const exercises = [{ eid: 1, name: "Chest Press", sets: 3, reps: 10 }];
    vi.mocked(WorkoutService.getExercisesService).mockResolvedValue(exercises);

    const response = await request(app).get("/workouts/4");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(exercises);
    expect(WorkoutService.getExercisesService).toHaveBeenCalledWith(4);
  });

  it("permits an existing workout with no exercises", async () => {
    vi.mocked(WorkoutService.getExercisesService).mockResolvedValue([]);

    const response = await request(app).get("/workouts/2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("POST /workouts creates a workout", async () => {
    const workout = { wid: 2, name: "Pull Day" };
    vi.mocked(WorkoutService.createWorkoutService).mockResolvedValue(workout);

    const response = await request(app)
      .post("/workouts")
      .send({ name: "Pull Day" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(workout);
    expect(WorkoutService.createWorkoutService).toHaveBeenCalledWith("Pull Day");
  });

  it("PUT /workouts/:id updates a workout", async () => {
    vi.mocked(WorkoutService.updateWorkoutService).mockResolvedValue(
      "Workout was updated!",
    );

    const response = await request(app)
      .put("/workouts/2")
      .send({ name: "Pull and Back Day" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Workout was updated!" });
    expect(WorkoutService.updateWorkoutService).toHaveBeenCalledWith(
      2,
      "Pull and Back Day",
    );
  });

  it("DELETE /workouts/:id deletes a workout", async () => {
    vi.mocked(WorkoutService.deleteWorkoutService).mockResolvedValue(
      "Workout was deleted!",
    );

    const response = await request(app).delete("/workouts/2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Workout was deleted!" });
    expect(WorkoutService.deleteWorkoutService).toHaveBeenCalledWith(2);
  });

  it("DELETE /workouts/:wid/exercises/:eid removes an exercise", async () => {
    vi.mocked(WorkoutService.deleteExerciseService).mockResolvedValue(
      "Exercise was deleted!",
    );

    const response = await request(app).delete("/workouts/2/exercises/8");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Exercise was deleted!" });
    expect(WorkoutService.deleteExerciseService).toHaveBeenCalledWith(2, 8);
  });

  it("returns 400 for an invalid workout ID", async () => {
    const response = await request(app).get("/workouts/invalid");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(WorkoutService.getExercisesService).not.toHaveBeenCalled();
  });

  it("returns 400 for a blank workout name", async () => {
    const response = await request(app)
      .post("/workouts")
      .send({ name: "   " });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(WorkoutService.createWorkoutService).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid workout and exercise IDs", async () => {
    const response = await request(app).delete("/workouts/0/exercises/nope");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(WorkoutService.deleteExerciseService).not.toHaveBeenCalled();
  });

  it("returns 404 when the workout does not exist", async () => {
    vi.mocked(WorkoutService.getExercisesService).mockRejectedValue(
      new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found"),
    );

    const response = await request(app).get("/workouts/999");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("WORKOUT_NOT_FOUND");
  });

  it("returns 404 when an exercise is not part of a workout", async () => {
    vi.mocked(WorkoutService.deleteExerciseService).mockRejectedValue(
      new AppError(
        404,
        "WORKOUT_EXERCISE_NOT_FOUND",
        "Exercise is not part of this workout",
      ),
    );

    const response = await request(app).delete("/workouts/2/exercises/999");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("WORKOUT_EXERCISE_NOT_FOUND");
  });

  it("returns 500 for an unexpected failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(WorkoutService.getWorkoutsService).mockRejectedValue(
      new Error("Database unavailable"),
    );

    const response = await request(app).get("/workouts");

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
