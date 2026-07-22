import { describe, it, expect, beforeAll } from "vitest";
import { createSession, verifySession } from "./session";
import { verifyPassword, hashPassword } from "./password";
import { checkRateLimit, resetAttempts, getRemainingAttempts } from "./rate-limit";

// ─── Setup: mock env vars ────────────────────────────────────────────
beforeAll(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  process.env.APP_URL = "http://localhost:3000";
  process.env.ADMIN_EMAIL = "test@test.com";
  process.env.ADMIN_PASSWORD_HASH = "$2a$12$dummy.hash.for.testing.purposes.only";
  process.env.SESSION_SECRET = "test-secret-that-is-at-least-32-chars-long!!";
  process.env.UPLOAD_ROOT = "./storage/uploads";
  process.env.IP_HASH_SECRET = "test-ip-hash-secret-16";
});

// ─── Session tests ───────────────────────────────────────────────────
describe("JWT Session", () => {
  it("createSession returns a Set-Cookie string with the token", async () => {
    const cookie = await createSession("admin@test.com");
    expect(cookie).toContain("admin_session=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
  });

  it("verifySession returns payload for a valid token", async () => {
    const cookie = await createSession("admin@test.com");
    // Extract token from cookie string
    const token = cookie.split("=")[1]?.split(";")[0] ?? "";
    const payload = await verifySession(token);
    expect(payload).not.toBeNull();
    expect(payload!.email).toBe("admin@test.com");
    expect(payload!.role).toBe("admin");
  });

  it("verifySession returns null for an invalid token", async () => {
    const payload = await verifySession("invalid.jwt.token");
    expect(payload).toBeNull();
  });

  it("verifySession returns null for undefined", async () => {
    const payload = await verifySession(undefined);
    expect(payload).toBeNull();
  });

  it("verifySession returns null for empty string", async () => {
    const payload = await verifySession("");
    expect(payload).toBeNull();
  });
});

// ─── Password tests ─────────────────────────────────────────────────
describe("Password", () => {
  it("hashPassword + verifyPassword round-trip", async () => {
    const hash = await hashPassword("mySecret123");
    expect(await verifyPassword("mySecret123", hash)).toBe(true);
    expect(await verifyPassword("wrongPassword", hash)).toBe(false);
  });

  it("verifyPassword returns false for empty hash", async () => {
    expect(await verifyPassword("anything", "")).toBe(false);
  });
});

// ─── Rate-limit tests ───────────────────────────────────────────────
describe("Rate Limit", () => {
  const TEST_IP = "192.168.1.100";

  it("allows first 5 attempts", () => {
    resetAttempts(TEST_IP);
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(TEST_IP)).toBe(true);
    }
  });

  it("blocks 6th attempt", () => {
    // Already at 5 from previous test — reset and redo
    resetAttempts(TEST_IP);
    for (let i = 0; i < 5; i++) checkRateLimit(TEST_IP);
    expect(checkRateLimit(TEST_IP)).toBe(false);
  });

  it("getRemainingAttempts decreases correctly", () => {
    const ip = "10.0.0.1";
    resetAttempts(ip);
    expect(getRemainingAttempts(ip)).toBe(5);
    checkRateLimit(ip);
    expect(getRemainingAttempts(ip)).toBe(4);
    checkRateLimit(ip);
    expect(getRemainingAttempts(ip)).toBe(3);
  });

  it("resetAttempts clears the counter", () => {
    const ip = "10.0.0.2";
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    expect(checkRateLimit(ip)).toBe(false);
    resetAttempts(ip);
    expect(checkRateLimit(ip)).toBe(true);
    expect(getRemainingAttempts(ip)).toBe(4);
  });
});
