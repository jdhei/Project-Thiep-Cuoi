import { NextRequest, NextResponse } from "next/server";
import { verifyCfAccess } from "@/lib/auth/cloudflare-access";
import { verifySession } from "@/lib/auth/session";

/**
 * Next.js Middleware — chạy trước MỌI request khớp matcher.
 *
 * Lớp 1: Cloudflare Zero Trust (nếu cấu hình CF_ACCESS_* — optional)
 *   → Chặn request đến khu vực admin nếu không qua CF Access.
 *
 * Lớp 2 (FIX-02): App-level JWT session (`admin_session`) — BẮT BUỘC.
 *   → Trước đây middleware bỏ qua lớp này (chỉ dựa vào guard trong từng
 *     page/route). Khi CF Access không bật, một route mới quên guard sẽ
 *     public ngay. Middleware giờ verify JWT tập trung cho mọi khu vực
 *     admin; guard trong page/route vẫn giữ như defense-in-depth.
 *
 * Khu vực bảo vệ: /admin/* (trừ /admin/login), /preview/*,
 * /api/admin/*, /api/uploads, /api/exports/*.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiArea =
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/uploads") ||
    pathname.startsWith("/api/exports");
  const isPageArea = pathname.startsWith("/admin") || pathname.startsWith("/preview");

  if (!isApiArea && !isPageArea) return NextResponse.next();

  // ── Lớp 1: Cloudflare Zero Trust (bypass nếu chưa cấu hình) ──
  const cfJwt = request.headers.get("cf-access-jwt-assertion");
  const cfPayload = await verifyCfAccess(cfJwt);

  if (!cfPayload) {
    // CF Access bật mà không có/sai token → 403
    return new NextResponse(
      JSON.stringify({
        error: "Access denied",
        message: "Vui lòng truy cập qua Cloudflare Zero Trust.",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // ── Lớp 2: App-level JWT session ──
  // Trang login phải truy cập được khi chưa đăng nhập
  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("admin_session")?.value;
  const session = await verifySession(token);

  if (!session) {
    if (isApiArea) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/preview/:path*",
    "/api/admin/:path*",
    "/api/uploads",
    "/api/exports/:path*",
  ],
};
