import { API_BASE_URL } from "./config.js";

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const apiError = body?.error;
    throw new ApiError(
      response.status,
      apiError?.code ?? "REQUEST_FAILED",
      apiError?.message ?? `Request failed with status ${response.status}`,
      apiError?.details,
    );
  }

  return body;
}

const jsonOptions = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const exerciseApi = {
  list(difficulty, target) {
    const query = new URLSearchParams({ difficulty, target });
    return request(`/exercises?${query}`);
  },
  create(exercise) {
    return request("/exercises", jsonOptions("POST", exercise));
  },
  update(exerciseId, exercise) {
    return request(`/exercises/${exerciseId}`, jsonOptions("PUT", exercise));
  },
  delete(exerciseId) {
    return request(`/exercises/${exerciseId}`, { method: "DELETE" });
  },
  addToWorkout(workoutExercise) {
    return request(
      "/exercises/add",
      jsonOptions("POST", workoutExercise),
    );
  },
};

export const workoutApi = {
  list() {
    return request("/workouts");
  },
  get(workoutId) {
    return request(`/workouts/${workoutId}`);
  },
  create(name) {
    return request("/workouts", jsonOptions("POST", { name }));
  },
  update(workoutId, name) {
    return request(
      `/workouts/${workoutId}`,
      jsonOptions("PUT", { name }),
    );
  },
  delete(workoutId) {
    return request(`/workouts/${workoutId}`, { method: "DELETE" });
  },
  removeExercise(workoutId, exerciseId) {
    return request(
      `/workouts/${workoutId}/exercises/${exerciseId}`,
      { method: "DELETE" },
    );
  },
};

