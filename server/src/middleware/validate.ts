import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../errors/app-error";

type RequestSchemas = Partial<Record<"body" | "params" | "query", ZodType>>;

export function validate(schemas: RequestSchemas): RequestHandler {
  return (req, res, next) => {
    const validated: Record<string, unknown> = {};

    for (const [location, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[location as keyof RequestSchemas]);

      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: [location, ...issue.path].join("."),
          message: issue.message,
        }));

        return next(
          new AppError(
            400,
            "VALIDATION_ERROR",
            "Request validation failed",
            details,
          ),
        );
      }

      validated[location] = result.data;
    }

    res.locals.validated = validated;
    next();
  };
}

