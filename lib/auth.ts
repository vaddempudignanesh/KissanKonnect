// lib/auth.ts
import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "dev-secret-change-me",
);
const COOKIE_NAME = "kk_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionRole = "farmer" | "buyer" | "logistics" | "fpo" | "admin";

export interface SessionPayload {
  userId: number;
  role: SessionRole;
  name: string;
}

// ---------------------------------------------------------------------------
// PASSWORD
// ---------------------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------------
// JWT
// ---------------------------------------------------------------------------
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(SECRET);
}

const VALID_ROLES: SessionRole[] = ["farmer", "buyer", "logistics", "fpo", "admin"];

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (
      typeof payload.userId === "number" &&
      typeof payload.role === "string" &&
      VALID_ROLES.includes(payload.role as SessionRole) &&
      typeof payload.name === "string"
    ) {
      return {
        userId: payload.userId,
        role: payload.role as SessionRole,
        name: payload.name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// COOKIE
// ---------------------------------------------------------------------------
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}