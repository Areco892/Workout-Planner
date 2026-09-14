const isLocalPreview = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);

const defaultApiUrl = isLocalPreview
  ? "http://localhost:5000"
  : "https://workout-planner-wf33.onrender.com";

export const API_BASE_URL = (
  window.WORKOUT_PLANNER_API_URL ?? defaultApiUrl
).replace(/\/$/, "");
