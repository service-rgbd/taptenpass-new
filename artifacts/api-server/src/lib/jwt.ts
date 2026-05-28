import jwt from "jsonwebtoken";
import { env } from "./env";

export interface AuthTokenPayload {
  sub: string;
  phone: string;
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded !== "object" || decoded === null || !("sub" in decoded)) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: String(decoded.sub),
    phone: String((decoded as AuthTokenPayload).phone ?? ""),
  };
}
