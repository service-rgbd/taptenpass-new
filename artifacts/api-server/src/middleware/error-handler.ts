import type { NextFunction, Request, Response } from "express";
import { isAppError } from "../lib/errors";
import { logger } from "../lib/logger";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (isAppError(error)) {
    res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
    return;
  }

  logger.error({ err: error }, "Unhandled error");
  res.status(500).json({ message: "Erreur interne du serveur." });
}
