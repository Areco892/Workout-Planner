import type { Request, Response } from "express";
import * as WorkoutPlanServices from "../services/workout_plan.service";

export async function getWorkouts(_req: Request, res: Response) {
    const workouts = await WorkoutPlanServices.getWorkoutsService();
    res.json(workouts);
}

export async function getExercises(_req: Request, res: Response) {
    const { id } = res.locals.validated.params;
    const exercises = await WorkoutPlanServices.getExercisesService(id);
    res.json(exercises);
}

export async function createWorkout(_req: Request, res: Response) {
    const { name } = res.locals.validated.body;
    const newWorkout = await WorkoutPlanServices.createWorkoutService(name);
    res.status(201).json(newWorkout);
}

export async function updateWorkout(_req: Request, res: Response) {
    const { id } = res.locals.validated.params;
    const { name } = res.locals.validated.body;
    const message = await WorkoutPlanServices.updateWorkoutService(id, name);
    res.json({ message });
}

export async function deleteWorkout(_req: Request, res: Response) {
    const { id } = res.locals.validated.params;
    const message = await WorkoutPlanServices.deleteWorkoutService(id);
    res.json({ message });
}

export async function deleteExercise(_req: Request, res: Response) {
    const { wid, eid } = res.locals.validated.params;
    const message = await WorkoutPlanServices.deleteExerciseService(wid, eid);
    res.json({ message });
}
