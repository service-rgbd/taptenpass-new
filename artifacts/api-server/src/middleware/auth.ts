import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";

export interface AuthenticatedRequest extends Request {
  userId: string;
  userPhone: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token d'authentification requis." });
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    (req as AuthenticatedRequest).userId = payload.sub;
    (req as AuthenticatedRequest).userPhone = payload.phone;
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
}
