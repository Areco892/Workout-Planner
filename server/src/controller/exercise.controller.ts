import type { Request, Response } from "express";
import * as ExerciseServices from "../services/exercise.service";

export async function getExercises(req: Request, res: Response){
    try {
        const { difficulty, target } = req.query;
        const exercises = await ExerciseServices.getExercisesService(difficulty as string, target as string);
        res.json(exercises);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
}

export async function createExercise(req: Request, res: Response) {
    try {
        const { name, image, target, difficulty } = req.body;
        const newExercise = await ExerciseServices.createExerciseService(name, image, target, difficulty);
        res.json(newExercise);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
}

export async function updateExercise(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { name, image, target, difficulty } = req.body;
        const updatedExercise = await ExerciseServices.updateExerciseService(id, name, image, target, difficulty);
        res.json({ message: "Exercise was updated!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
}

export async function deleteExercise(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const response = await ExerciseServices.deleteExerciseService(id);
        res.json({ message: "Exercise was deleted!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error."});
    }
}

export async function addExercise(req: Request, res: Response) {
    try {
        const { wid, eid, sets, weight, reps } = req.body;
        const exercise = await ExerciseServices.addExerciseService(wid, eid, sets, weight, reps);
        res.json(exercise);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}
