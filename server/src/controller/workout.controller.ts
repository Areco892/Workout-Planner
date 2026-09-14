import type { Request, Response } from "express";
import * as WorkoutService from "../services/workout.service";

export async function getExercises(_req: Request, res: Response) {
    const { wid } = res.locals.validated.params;
    const exercises = await WorkoutService.getExercisesService(wid);
    res.json(exercises);
}
