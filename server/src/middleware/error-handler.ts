import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error";

type DatabaseError = Error & { code?: string };

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
    return;
  }

  const databaseError = error as DatabaseError;
  if (databaseError.code === "23505") {
    res.status(409).json({
      error: {
        code: "RESOURCE_CONFLICT",
        message: "The resource already exists",
      },
    });
    return;
  }

  if (databaseError.code === "23503") {
    res.status(409).json({
      error: {
        code: "REFERENCE_CONFLICT",
        message: "A referenced resource does not exist",
      },
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};

