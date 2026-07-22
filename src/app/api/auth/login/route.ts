import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit, resetAttempts } from "@/lib/auth/rate-limit";

// ─── Schema ──────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được trống"),
});

// AUTH-07: Generic error message — never reveal which field is wrong.
const GENERIC_ERROR = "Thông tin đăng nhập không đúng";

// ─── POST /api/auth/login ────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Get client IP for rate-limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // 2. Rate-limit check (AUTH-06)
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 429 },
      );
    }

    // 3. Parse & validate body
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 },
      );
    }

    const { email, password } = parsed.data;
    const env = getEnv();

    // 4. Compare email (case-insensitive)
    if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 },
      );
    }

    // 5. Compare password hash
    const passwordValid = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
    if (!passwordValid) {
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 401 },
      );
    }

    // 6. Success — create session, reset rate-limit
    resetAttempts(ip);
    const setCookie = await createSession(email);

    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", setCookie);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Lỗi hệ thống" },
      { status: 500 },
    );
  }
}
