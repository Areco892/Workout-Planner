import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
import { AppError } from "../src/errors/app-error";
import * as WorkoutService from "../src/services/workout.service";

vi.mock("../src/services/workout.service", () => ({
  getExercisesService: vi.fn(),
}));

describe("active workout routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /workouts/:wid returns workout exercises", async () => {
    const exercises = [{ eid: 1, name: "Chest Press", sets: 3, reps: 10 }];
    vi.mocked(WorkoutService.getExercisesService).mockResolvedValue(exercises);

    const response = await request(app).get("/workouts/4");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(exercises);
    expect(WorkoutService.getExercisesService).toHaveBeenCalledWith(4);
  });

  it("returns 400 for an invalid workout ID", async () => {
    const response = await request(app).get("/workouts/invalid");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(WorkoutService.getExercisesService).not.toHaveBeenCalled();
  });

  it("returns 404 when the workout does not exist", async () => {
    vi.mocked(WorkoutService.getExercisesService).mockRejectedValue(
      new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found"),
    );

    const response = await request(app).get("/workouts/999");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("WORKOUT_NOT_FOUND");
  });

  it("returns 500 for an unexpected failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(WorkoutService.getExercisesService).mockRejectedValue(
      new Error("Database unavailable"),
    );

    const response = await request(app).get("/workouts/4");

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});

