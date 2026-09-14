import * as WorkoutPlanModel from "../models/workout_plan.model";
import { AppError } from "../errors/app-error";

export async function getWorkoutsService() {
    return await WorkoutPlanModel.getWorkouts();
}

export async function getExercisesService(workoutId: number) {
    const exercises = await WorkoutPlanModel.getExercises(workoutId);
    if (exercises === null) {
        throw new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found");
    }
    return exercises;
}

export async function createWorkoutService(workoutName: string) {
    return await WorkoutPlanModel.createWorkout(workoutName);
}

export async function updateWorkoutService(workoutId: number, workoutName: string) {
    const updated = await WorkoutPlanModel.updateWorkout(workoutId, workoutName);
    if (!updated) {
        throw new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found");
    }
    return "Workout was updated!";
}

export async function deleteWorkoutService(workoutId: number) {
    const deleted = await WorkoutPlanModel.deleteWorkout(workoutId);
    if (!deleted) {
        throw new AppError(404, "WORKOUT_NOT_FOUND", "Workout not found");
    }
    return "Workout was deleted!";
}

export async function deleteExerciseService(wid: number, eid: number) {
    const deleted = await WorkoutPlanModel.deleteExercise(wid, eid);
    if (!deleted) {
        throw new AppError(
            404,
            "WORKOUT_EXERCISE_NOT_FOUND",
            "Exercise is not part of this workout",
        );
    }
    return "Exercise was deleted!";
}
