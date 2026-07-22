import { NextRequest, NextResponse } from "next/server";
import { verifyCfAccess } from "@/lib/auth/cloudflare-access";

/**
 * Next.js Middleware — chạy trước MỌI request khớp matcher.
 *
 * Lớp 1: Cloudflare Zero Trust (nếu cấu hình)
 *   → Chặn request đến /admin/* và /preview/* nếu không qua CF Access.
 *
 * Lớp 2: App-level JWT session (trong layout/page — không ở middleware
 *   vì cần cookies() async ở App Router).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ bảo vệ admin & preview routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/preview")) {
    const cfJwt = request.headers.get("cf-access-jwt-assertion");
    const cfPayload = await verifyCfAccess(cfJwt);

    if (!cfPayload) {
      // Nếu CF Access bật mà không có token → 403
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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/preview/:path*"],
};
