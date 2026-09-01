import jwt from "jsonwebtoken";
import type { Role } from "@/generated/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET as string;
const SESSION_COOKIE_NAME = "session_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string;
  role: Role;
}

export function signSessionToken(payload: SessionPayload) {
  return jwt.sign({ role: payload.role }, JWT_SECRET, {
    subject: payload.sub,
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.role !== "string") {
      return null;
    }
    return { sub: decoded.sub, role: decoded.role as Role };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
