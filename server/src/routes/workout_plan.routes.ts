import Router from "express";
import { getWorkouts, getExercises, createWorkout, updateWorkout, deleteWorkout, deleteExercise } from "../controller/workout_plan.controller";
import { validate } from "../middleware/validate";
import {
  workoutBodySchema,
  workoutExerciseIdSchema,
  workoutIdSchema,
} from "../validation/workout.schemas";

const router = Router();

router.get("/", getWorkouts);
router.get("/:id", validate({ params: workoutIdSchema }), getExercises);
router.post("/", validate({ body: workoutBodySchema }), createWorkout);
router.put(
  "/:id",
  validate({ params: workoutIdSchema, body: workoutBodySchema }),
  updateWorkout,
);
router.delete("/:id", validate({ params: workoutIdSchema }), deleteWorkout);
router.delete(
  "/:wid/:eid",
  validate({ params: workoutExerciseIdSchema }),
  deleteExercise,
);

export default router;
