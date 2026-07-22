"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import {
  createGuestSchema,
  updateGuestSchema,
  generateInvitationCode,
} from "./guest.schemas";

type ActionResult =
  | { success: true; id?: string; invitationCode?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Sinh invitationCode duy nhất ───────────────────────────────────

async function generateUniqueCode(): Promise<string> {
  // Thử tối đa 10 lần để tránh trùng (unique constraint DB là chốt chặn cuối).
  for (let i = 0; i < 10; i++) {
    const code = generateInvitationCode();
    const existing = await db.guest.findUnique({
      where: { invitationCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("Không sinh được mã mời duy nhất, vui lòng thử lại");
}

// ─── Create Guest (GUEST-01, GUEST-02) ──────────────────────────────

export async function createGuestAction(
  weddingId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({
    where: { id: weddingId },
    select: { id: true },
  });
  if (!wedding) return { success: false, error: "Không tìm thấy thiệp" };

  const parsed = createGuestSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    maximumPeople: formData.get("maximumPeople") ?? 1,
    personalizedMessage: formData.get("personalizedMessage") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const invitationCode = await generateUniqueCode();

  const guest = await db.guest.create({
    data: {
      weddingId,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      maximumPeople: parsed.data.maximumPeople,
      personalizedMessage: parsed.data.personalizedMessage || null,
      invitationCode,
    },
  });

  revalidatePath(`/admin/weddings/${weddingId}/guests`);
  return { success: true, id: guest.id, invitationCode };
}

// ─── Update Guest (GUEST-01) ────────────────────────────────────────

export async function updateGuestAction(
  weddingId: string,
  guestId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.guest.findFirst({
    where: { id: guestId, weddingId },
    select: { id: true },
  });
  if (!existing) return { success: false, error: "Không tìm thấy khách mời" };

  const parsed = updateGuestSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    maximumPeople: formData.get("maximumPeople") ?? 1,
    personalizedMessage: formData.get("personalizedMessage") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.guest.update({
    where: { id: guestId },
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      maximumPeople: parsed.data.maximumPeople,
      personalizedMessage: parsed.data.personalizedMessage || null,
    },
  });

  revalidatePath(`/admin/weddings/${weddingId}/guests`);
  return { success: true, id: guestId };
}

// ─── Delete Guest (GUEST-01) ────────────────────────────────────────

export async function deleteGuestAction(
  weddingId: string,
  guestId: string,
): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.guest.findFirst({
    where: { id: guestId, weddingId },
    select: { id: true },
  });
  if (!existing) return { success: false, error: "Không tìm thấy khách mời" };

  // Rsvp.guestId dùng onDelete: SetNull → RSVP đã gửi vẫn giữ lại.
  await db.guest.delete({ where: { id: guestId } });

  revalidatePath(`/admin/weddings/${weddingId}/guests`);
  return { success: true };
}
