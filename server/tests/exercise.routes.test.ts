import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app";
import * as ExerciseServices from "../src/services/exercise.service";

vi.mock("../src/services/exercise.service", () => ({
  getExercisesService: vi.fn(),
  createExerciseService: vi.fn(),
  updateExerciseService: vi.fn(),
  deleteExerciseService: vi.fn(),
  addExerciseService: vi.fn(),
}));

describe("exercise routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /exercises returns exercises using both filters", async () => {
    const exercises = [
      {
        eid: 1,
        name: "Chest Press",
        image: "img/chest-press.webp",
        target: "Chest",
        difficulty: "Beginner",
      },
    ];
    vi.mocked(ExerciseServices.getExercisesService).mockResolvedValue(exercises);

    const response = await request(app)
      .get("/exercises")
      .query({ difficulty: "Beginner", target: "Chest" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(exercises);
    expect(ExerciseServices.getExercisesService).toHaveBeenCalledOnce();
    expect(ExerciseServices.getExercisesService).toHaveBeenCalledWith(
      "Beginner",
      "Chest",
    );
  });

  it("POST /exercises creates an exercise", async () => {
    const exercise = {
      name: "Push Up",
      image: "img/push-up.webp",
      target: "Chest",
      difficulty: "Beginner",
    };
    const createdExercise = { eid: 22, ...exercise };
    const serviceResult = {
      command: "INSERT",
      rowCount: 1,
      oid: 0,
      fields: [],
      rows: [createdExercise],
    };
    vi.mocked(ExerciseServices.createExerciseService).mockResolvedValue(
      serviceResult,
    );

    const response = await request(app).post("/exercises").send(exercise);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(serviceResult);
    expect(ExerciseServices.createExerciseService).toHaveBeenCalledWith(
      exercise.name,
      exercise.image,
      exercise.target,
      exercise.difficulty,
    );
  });

  it("POST /exercises/add adds an exercise to a workout", async () => {
    vi.mocked(ExerciseServices.addExerciseService).mockResolvedValue(
      "Exercise was added successfully!",
    );

    const response = await request(app).post("/exercises/add").send({
      wid: 3,
      eid: 8,
      sets: 4,
      weight: 25,
      reps: 10,
    });

    expect(response.status).toBe(200);
    expect(response.body).toBe("Exercise was added successfully!");
    expect(ExerciseServices.addExerciseService).toHaveBeenCalledWith(
      3,
      8,
      4,
      25,
      10,
    );
  });

  it("PUT /exercises/:id updates an exercise", async () => {
    vi.mocked(ExerciseServices.updateExerciseService).mockResolvedValue(undefined);

    const response = await request(app).put("/exercises/8").send({
      name: "Front Raise",
      image: "img/front-raises.webp",
      target: "Shoulders",
      difficulty: "Beginner",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Exercise was updated!" });
    expect(ExerciseServices.updateExerciseService).toHaveBeenCalledWith(
      "8",
      "Front Raise",
      "img/front-raises.webp",
      "Shoulders",
      "Beginner",
    );
  });

  it("DELETE /exercises/:id deletes an exercise", async () => {
    vi.mocked(ExerciseServices.deleteExerciseService).mockResolvedValue(
      "Exercise was deleted!",
    );

    const response = await request(app).delete("/exercises/8");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Exercise was deleted!" });
    expect(ExerciseServices.deleteExerciseService).toHaveBeenCalledWith("8");
  });

  it("returns 500 when the exercise service fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(ExerciseServices.getExercisesService).mockRejectedValue(
      new Error("Database unavailable"),
    );

    const response = await request(app)
      .get("/exercises")
      .query({ difficulty: "All", target: "All" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Server error." });
  });
});
