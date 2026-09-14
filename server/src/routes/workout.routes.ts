import { Router } from "express";
import { getExercises } from "../controller/workout.controller";
import { validate } from "../middleware/validate";
import { activeWorkoutIdSchema } from "../validation/workout.schemas";

const router = Router();

router.get("/:wid", validate({ params: activeWorkoutIdSchema }), getExercises);

export default router;
