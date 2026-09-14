import { z } from "zod";

const positiveId = z.coerce.number().int().positive();

export const workoutIdSchema = z.object({
  id: positiveId,
});

export const activeWorkoutIdSchema = z.object({
  wid: positiveId,
});

export const workoutExerciseIdSchema = z.object({
  wid: positiveId,
  eid: positiveId,
});

export const workoutBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
}).strict();

