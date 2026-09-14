import * as WorkoutModel from "../models/workout.model";
import { AppError } from "../errors/app-error";

export async function getExercisesService(workoutId: number) {
    const exercises = await WorkoutModel.getExercises(workoutId);
    if (exercises === null) {
        throw new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found");
    }
    return exercises;
}
