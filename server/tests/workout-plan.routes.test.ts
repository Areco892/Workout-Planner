import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
import { AppError } from "../src/errors/app-error";
import * as WorkoutPlanServices from "../src/services/workout_plan.service";

vi.mock("../src/services/workout_plan.service", () => ({
  getWorkoutsService: vi.fn(),
  getExercisesService: vi.fn(),
  createWorkoutService: vi.fn(),
  updateWorkoutService: vi.fn(),
  deleteWorkoutService: vi.fn(),
  deleteExerciseService: vi.fn(),
}));

describe("workout plan routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /workoutplans returns workout plans", async () => {
    const workouts = [{ wid: 1, name: "Push Day" }];
    vi.mocked(WorkoutPlanServices.getWorkoutsService).mockResolvedValue(workouts);

    const response = await request(app).get("/workoutplans");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(workouts);
  });

  it("GET /workoutplans/:id permits an empty workout", async () => {
    vi.mocked(WorkoutPlanServices.getExercisesService).mockResolvedValue([]);

    const response = await request(app).get("/workoutplans/2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(WorkoutPlanServices.getExercisesService).toHaveBeenCalledWith(2);
  });

  it("POST /workoutplans creates a workout", async () => {
    const workout = { wid: 2, name: "Pull Day" };
    vi.mocked(WorkoutPlanServices.createWorkoutService).mockResolvedValue(workout);

    const response = await request(app)
      .post("/workoutplans")
      .send({ name: "Pull Day" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(workout);
    expect(WorkoutPlanServices.createWorkoutService).toHaveBeenCalledWith(
      "Pull Day",
    );
  });

  it("PUT /workoutplans/:id updates a workout", async () => {
    vi.mocked(WorkoutPlanServices.updateWorkoutService).mockResolvedValue(
      "Workout was updated!",
    );

    const response = await request(app)
      .put("/workoutplans/2")
      .send({ name: "Pull and Back Day" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Workout was updated!" });
    expect(WorkoutPlanServices.updateWorkoutService).toHaveBeenCalledWith(
      2,
      "Pull and Back Day",
    );
  });

  it("DELETE /workoutplans/:id deletes a workout", async () => {
    vi.mocked(WorkoutPlanServices.deleteWorkoutService).mockResolvedValue(
      "Workout was deleted!",
    );

    const response = await request(app).delete("/workoutplans/2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Workout was deleted!" });
    expect(WorkoutPlanServices.deleteWorkoutService).toHaveBeenCalledWith(2);
  });

  it("DELETE /workoutplans/:wid/:eid removes an exercise", async () => {
    vi.mocked(WorkoutPlanServices.deleteExerciseService).mockResolvedValue(
      "Exercise was deleted!",
    );

    const response = await request(app).delete("/workoutplans/2/8");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Exercise was deleted!" });
    expect(WorkoutPlanServices.deleteExerciseService).toHaveBeenCalledWith(2, 8);
  });

  it("returns 400 for a blank workout name", async () => {
    const response = await request(app)
      .post("/workoutplans")
      .send({ name: "   " });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(WorkoutPlanServices.createWorkoutService).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid workout and exercise IDs", async () => {
    const response = await request(app).delete("/workoutplans/0/nope");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(WorkoutPlanServices.deleteExerciseService).not.toHaveBeenCalled();
  });

  it("returns 404 when the workout does not exist", async () => {
    vi.mocked(WorkoutPlanServices.updateWorkoutService).mockRejectedValue(
      new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found"),
    );

    const response = await request(app)
      .put("/workoutplans/999")
      .send({ name: "Missing Workout" });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("WORKOUT_NOT_FOUND");
  });

  it("returns 404 when an exercise is not part of a workout", async () => {
    vi.mocked(WorkoutPlanServices.deleteExerciseService).mockRejectedValue(
      new AppError(
        404,
        "WORKOUT_EXERCISE_NOT_FOUND",
        "Exercise is not part of this workout",
      ),
    );

    const response = await request(app).delete("/workoutplans/2/999");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("WORKOUT_EXERCISE_NOT_FOUND");
  });
});

