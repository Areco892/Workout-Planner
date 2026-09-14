import { Router } from "express";
import { getExercises, createExercise, updateExercise, deleteExercise, addExercise } from "../controller/exercise.controller";
import { validate } from "../middleware/validate";
import {
  addExerciseBodySchema,
  exerciseBodySchema,
  exerciseFiltersSchema,
  exerciseIdSchema,
} from "../validation/exercise.schemas";

const router = Router();

router.get("/", validate({ query: exerciseFiltersSchema }), getExercises);
router.post("/", validate({ body: exerciseBodySchema }), createExercise);
router.post("/add", validate({ body: addExerciseBodySchema }), addExercise);
router.put(
  "/:id",
  validate({ params: exerciseIdSchema, body: exerciseBodySchema }),
  updateExercise,
);
router.delete("/:id", validate({ params: exerciseIdSchema }), deleteExercise);
export default router;
