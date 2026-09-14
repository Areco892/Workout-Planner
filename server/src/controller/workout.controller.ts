import type { Request, Response } from "express";
import * as WorkoutService from "../services/workout.service";

export async function getWorkouts(_req: Request, res: Response) {
    const workouts = await WorkoutService.getWorkoutsService();
    res.json(workouts);
}

export async function getExercises(_req: Request, res: Response) {
    const { id } = res.locals.validated.params;
    const exercises = await WorkoutService.getExercisesService(id);
    res.json(exercises);
}

export async function createWorkout(_req: Request, res: Response) {
    const { name } = res.locals.validated.body;
    const workout = await WorkoutService.createWorkoutService(name);
    res.status(201).json(workout);
}

export async function updateWorkout(_req: Request, res: Response) {
    const { id } = res.locals.validated.params;
    const { name } = res.locals.validated.body;
    const message = await WorkoutService.updateWorkoutService(id, name);
    res.json({ message });
}

export async function deleteWorkout(_req: Request, res: Response) {
    const { id } = res.locals.validated.params;
    const message = await WorkoutService.deleteWorkoutService(id);
    res.json({ message });
}

export async function deleteExercise(_req: Request, res: Response) {
    const { wid, eid } = res.locals.validated.params;
    const message = await WorkoutService.deleteExerciseService(wid, eid);
    res.json({ message });
}
