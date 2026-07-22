import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

// ─── Types ───────────────────────────────────────────────────────────
export interface AdminSessionPayload extends JWTPayload {
  email: string;
  role: "admin";
}

// ─── Constants ───────────────────────────────────────────────────────
const COOKIE_NAME = "admin_session";
const EXPIRY = "24h";

/** Derive signing key from SESSION_SECRET. */
function getSecret(): Uint8Array {
  return new TextEncoder().encode(getEnv().SESSION_SECRET);
}

// ─── Create ──────────────────────────────────────────────────────────
/**
 * Sign a JWT for the given admin email and return a Set-Cookie header value.
 */
export async function createSession(email: string): Promise<string> {
  const token = await new SignJWT({ email, role: "admin" } satisfies AdminSessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());

  const isProduction = getEnv().NODE_ENV === "production";

  // Build cookie string (httpOnly, sameSite=lax, secure in production)
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${24 * 60 * 60}`, // 24h in seconds
  ];
  if (isProduction) parts.push("Secure");

  return parts.join("; ");
}

// ─── Verify ──────────────────────────────────────────────────────────
/**
 * Verify a JWT token string. Returns the payload if valid, null otherwise.
 */
export async function verifySession(
  token: string | undefined,
): Promise<AdminSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    // Ensure required fields exist
    if (payload.email && payload.role === "admin") {
      return payload as AdminSessionPayload;
    }
    return null;
  } catch {
    // Expired, invalid signature, malformed, etc.
    return null;
  }
}

// ─── Read from cookies (server component / route handler) ────────────
/**
 * Read the admin session from the request cookies.
 * Returns the payload if authenticated, null otherwise.
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return verifySession(cookie?.value);
}

// ─── Clear ───────────────────────────────────────────────────────────
/**
 * Return a Set-Cookie header value that clears the session cookie.
 */
export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
