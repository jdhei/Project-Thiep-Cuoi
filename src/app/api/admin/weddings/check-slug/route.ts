import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { slugSchema } from "@/lib/utils/slug";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const excludeId = request.nextUrl.searchParams.get("excludeId") ?? undefined;

  // Validate slug format
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return NextResponse.json({
      available: false,
      reason: parsed.error.issues[0]?.message ?? "Slug không hợp lệ",
    });
  }

  // Check uniqueness
  const existing = await db.wedding.findUnique({
    where: { slug: parsed.data },
    select: { id: true },
  });

  const available = !existing || (excludeId ? existing.id === excludeId : false);

  return NextResponse.json({ available });
}
