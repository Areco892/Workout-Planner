import { z } from "zod";

const difficulty = z.enum(["Beginner", "Intermediate", "Advanced"]);
const positiveId = z.coerce.number().int().positive();

export const exerciseFiltersSchema = z.object({
  difficulty: difficulty.or(z.literal("All")).default("All"),
  target: z.string().trim().min(1).max(100).default("All"),
});

export const exerciseIdSchema = z.object({
  id: positiveId,
});

export const exerciseBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
  image: z.string().trim().min(1).max(255),
  target: z.string().trim().min(1).max(100),
  difficulty,
}).strict();

export const addExerciseBodySchema = z.object({
  wid: positiveId,
  eid: positiveId,
  sets: z.coerce.number().int().positive(),
  weight: z.coerce.number().int().nonnegative(),
  reps: z.coerce.number().int().positive(),
}).strict();

