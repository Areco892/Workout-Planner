import type { Request, Response } from "express";
import * as ExerciseServices from "../services/exercise.service";

export async function getExercises(_req: Request, res: Response) {
    const { difficulty, target } = res.locals.validated.query;
    const exercises = await ExerciseServices.getExercisesService(difficulty, target);
    res.json(exercises);
}

export async function createExercise(_req: Request, res: Response) {
    const { name, image, target, difficulty } = res.locals.validated.body;
    const newExercise = await ExerciseServices.createExerciseService(name, image, target, difficulty);
    res.status(201).json(newExercise);
}

export async function updateExercise(_req: Request, res: Response) {
    const { id } = res.locals.validated.params;
    const { name, image, target, difficulty } = res.locals.validated.body;
    await ExerciseServices.updateExerciseService(id, name, image, target, difficulty);
    res.json({ message: "Exercise was updated!" });
}

export async function deleteExercise(_req: Request, res: Response) {
    const { id } = res.locals.validated.params;
    const message = await ExerciseServices.deleteExerciseService(id);
    res.json({ message });
}

export async function addExercise(_req: Request, res: Response) {
    const { wid, eid, sets, weight, reps } = res.locals.validated.body;
    const message = await ExerciseServices.addExerciseService(wid, eid, sets, weight, reps);
    res.json(message);
}
