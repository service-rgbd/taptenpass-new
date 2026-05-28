import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../lib/errors";

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(
          400,
          result.error.issues.map((issue) => issue.message).join(", "),
          "VALIDATION_ERROR",
        ),
      );
      return;
    }

    req.body = result.data;
    next();
  };
}
