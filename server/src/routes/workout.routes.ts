import { Router } from "express";
import {
  createWorkout,
  deleteExercise,
  deleteWorkout,
  getExercises,
  getWorkouts,
  updateWorkout,
} from "../controller/workout.controller";
import { validate } from "../middleware/validate";
import {
  workoutBodySchema,
  workoutExerciseIdSchema,
  workoutIdSchema,
} from "../validation/workout.schemas";

const router = Router();

router.get("/", getWorkouts);
router.post("/", validate({ body: workoutBodySchema }), createWorkout);
router.get("/:id", validate({ params: workoutIdSchema }), getExercises);
router.put(
  "/:id",
  validate({ params: workoutIdSchema, body: workoutBodySchema }),
  updateWorkout,
);
router.delete(
  "/:wid/exercises/:eid",
  validate({ params: workoutExerciseIdSchema }),
  deleteExercise,
);
router.delete("/:id", validate({ params: workoutIdSchema }), deleteWorkout);

export default router;
