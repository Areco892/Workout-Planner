import * as WorkoutModel from "../models/workout.model";
import { AppError } from "../errors/app-error";

export async function getWorkoutsService() {
    return WorkoutModel.getWorkouts();
}

export async function getExercisesService(workoutId: number) {
    const exercises = await WorkoutModel.getExercises(workoutId);
    if (exercises === null) {
        throw new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found");
    }
    return exercises;
}

export async function createWorkoutService(name: string) {
    return WorkoutModel.createWorkout(name);
}

export async function updateWorkoutService(workoutId: number, name: string) {
    const updated = await WorkoutModel.updateWorkout(workoutId, name);
    if (!updated) {
        throw new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found");
    }
    return "Workout was updated!";
}

export async function deleteWorkoutService(workoutId: number) {
    const deleted = await WorkoutModel.deleteWorkout(workoutId);
    if (!deleted) {
        throw new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found");
    }
    return "Workout was deleted!";
}

export async function deleteExerciseService(workoutId: number, exerciseId: number) {
    const deleted = await WorkoutModel.deleteExercise(workoutId, exerciseId);
    if (!deleted) {
        throw new AppError(
            404,
            "WORKOUT_EXERCISE_NOT_FOUND",
            "Exercise is not part of this workout",
        );
    }
    return "Exercise was deleted!";
}
