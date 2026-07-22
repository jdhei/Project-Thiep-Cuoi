"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import {
  createWeddingSchema,
  updateWeddingSchema,
  type CreateWeddingInput,
  type UpdateWeddingInput,
} from "./wedding.schemas";
import { validatePublishReady } from "./wedding.validators";

// ─── Helpers ─────────────────────────────────────────────────────────

type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function checkSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await db.wedding.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  return false;
}

// ─── Create Wedding ──────────────────────────────────────────────────

export async function createWeddingAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();

  const raw: CreateWeddingInput = {
    groomName: formData.get("groomName") as string,
    brideName: formData.get("brideName") as string,
    slug: formData.get("slug") as string,
    weddingDate: (formData.get("weddingDate") as string) || undefined,
  };

  const parsed = createWeddingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (!(await checkSlugUnique(parsed.data.slug))) {
    return { success: false, error: "Slug này đã được sử dụng" };
  }

  const wedding = await db.wedding.create({
    data: {
      groomName: parsed.data.groomName,
      brideName: parsed.data.brideName,
      slug: parsed.data.slug,
      weddingDate: parsed.data.weddingDate ? new Date(parsed.data.weddingDate) : undefined,
    },
  });

  revalidatePath("/admin/weddings");
  redirect(`/admin/weddings/${wedding.id}/content`);
}

// ─── Update Wedding Content ─────────────────────────────────────────

export async function updateWeddingAction(
  weddingId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();

  const raw: UpdateWeddingInput = {
    groomName: formData.get("groomName") as string,
    brideName: formData.get("brideName") as string,
    slug: formData.get("slug") as string,
    weddingDate: (formData.get("weddingDate") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    introduction: (formData.get("introduction") as string) || undefined,
    loveStory: (formData.get("loveStory") as string) || undefined,
    primaryColor: (formData.get("primaryColor") as string) || undefined,
    giftData: (formData.get("giftData") as string) || undefined,
    showCountdown: formData.get("showCountdown") === "on",
    showStory: formData.get("showStory") === "on",
    showGallery: formData.get("showGallery") === "on",
    showRsvp: formData.get("showRsvp") === "on",
    showWishes: formData.get("showWishes") === "on",
    showGift: formData.get("showGift") === "on",
    showMusic: formData.get("showMusic") === "on",
  };

  const parsed = updateWeddingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Validate giftData is valid JSON if provided
  if (parsed.data.giftData) {
    try {
      JSON.parse(parsed.data.giftData);
    } catch {
      return { success: false, error: "Gift data không phải JSON hợp lệ" };
    }
  }

  if (!(await checkSlugUnique(parsed.data.slug, weddingId))) {
    return { success: false, error: "Slug này đã được sử dụng" };
  }

  await db.wedding.update({
    where: { id: weddingId },
    data: {
      groomName: parsed.data.groomName,
      brideName: parsed.data.brideName,
      slug: parsed.data.slug,
      weddingDate: parsed.data.weddingDate ? new Date(parsed.data.weddingDate) : null,
      title: parsed.data.title || null,
      introduction: parsed.data.introduction || null,
      loveStory: parsed.data.loveStory || null,
      primaryColor: parsed.data.primaryColor || "#8A6D3B",
      giftData: parsed.data.giftData || null,
      showCountdown: parsed.data.showCountdown,
      showStory: parsed.data.showStory,
      showGallery: parsed.data.showGallery,
      showRsvp: parsed.data.showRsvp,
      showWishes: parsed.data.showWishes,
      showGift: parsed.data.showGift,
      showMusic: parsed.data.showMusic,
    },
  });

  revalidatePath(`/admin/weddings/${weddingId}/content`);
  revalidatePath("/admin/weddings");

  return { success: true, id: weddingId };
}

// ─── Archive / Unarchive ─────────────────────────────────────────────

export async function archiveWeddingAction(weddingId: string): Promise<ActionResult> {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({ where: { id: weddingId }, select: { status: true, slug: true } });
  if (!wedding) return { success: false, error: "Không tìm thấy thiệp" };
  if (wedding.status === "ARCHIVED") return { success: false, error: "Thiệp đã ở trạng thái archived" };

  await db.wedding.update({ where: { id: weddingId }, data: { status: "ARCHIVED" } });

  revalidatePath("/admin/weddings");
  revalidatePath(`/w/${wedding.slug}`);
  return { success: true };
}

export async function unarchiveWeddingAction(weddingId: string): Promise<ActionResult> {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({ where: { id: weddingId }, select: { status: true } });
  if (!wedding) return { success: false, error: "Không tìm thấy thiệp" };
  if (wedding.status !== "ARCHIVED") return { success: false, error: "Thiệp không ở trạng thái archived" };

  await db.wedding.update({ where: { id: weddingId }, data: { status: "DRAFT" } });

  revalidatePath("/admin/weddings");
  return { success: true };
}

// ─── Publish / Unpublish ─────────────────────────────────────────────

export async function publishWeddingAction(weddingId: string): Promise<ActionResult & { errors?: string[] }> {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({
    where: { id: weddingId },
    include: { events: true },
  });
  if (!wedding) return { success: false, error: "Không tìm thấy thiệp" };

  const validation = validatePublishReady(wedding);
  if (!validation.valid) {
    return { success: false, error: "Chưa đủ điều kiện publish", errors: validation.errors };
  }

  await db.wedding.update({ where: { id: weddingId }, data: { status: "PUBLISHED" } });

  revalidatePath("/admin/weddings");
  revalidatePath(`/w/${wedding.slug}`);
  revalidatePath(`/admin/weddings/${weddingId}/publish`);
  return { success: true };
}

export async function unpublishWeddingAction(weddingId: string): Promise<ActionResult> {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({ where: { id: weddingId }, select: { status: true, slug: true } });
  if (!wedding) return { success: false, error: "Không tìm thấy thiệp" };
  if (wedding.status !== "PUBLISHED") return { success: false, error: "Thiệp không ở trạng thái published" };

  await db.wedding.update({ where: { id: weddingId }, data: { status: "DRAFT" } });

  revalidatePath("/admin/weddings");
  revalidatePath(`/w/${wedding.slug}`);
  revalidatePath(`/admin/weddings/${weddingId}/publish`);
  return { success: true };
}
