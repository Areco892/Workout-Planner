import * as ExerciseModel from "../models/exercise.model";
import { AppError } from "../errors/app-error";

export async function getExercisesService(difficulty: string, target: string) {
    return await ExerciseModel.getExercises(difficulty, target);
}

export async function createExerciseService(name: string, image: string, target: string, difficulty: string) {
    return await ExerciseModel.createExercise(name, image, target, difficulty);
}

export async function updateExerciseService(id: number, name: string, image: string, target: string, difficulty: string) {
    const result = await ExerciseModel.updateExercise(id, name, image, target, difficulty);
    if (result.rowCount === 0) {
        throw new AppError(404, "EXERCISE_NOT_FOUND", "Exercise not found");
    }
    return result;
}

export async function deleteExerciseService(id: number) {
    const result = await ExerciseModel.deleteExercise(id);
    if (result.rowCount === 0) {
        throw new AppError(404, "EXERCISE_NOT_FOUND", "Exercise not found");
    }
    return "Exercise was deleted!";
}

export async function addExerciseService(wid: number, eid: number, sets: number, weight: number, reps: number) {
    return await ExerciseModel.addExercise(wid, eid, sets, weight, reps);
}
