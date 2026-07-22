"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { createEventSchema, updateEventSchema, reorderEventsSchema } from "./event.schemas";

type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Create Event ────────────────────────────────────────────────────

export async function createEventAction(
  weddingId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({ where: { id: weddingId }, select: { id: true } });
  if (!wedding) return { success: false, error: "Không tìm thấy thiệp" };

  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    startsAt: formData.get("startsAt"),
    address: formData.get("address"),
    mapUrl: formData.get("mapUrl") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Auto sortOrder = max + 1
  const maxSort = await db.weddingEvent.aggregate({
    where: { weddingId },
    _max: { sortOrder: true },
  });

  const event = await db.weddingEvent.create({
    data: {
      weddingId,
      title: parsed.data.title,
      startsAt: new Date(parsed.data.startsAt),
      address: parsed.data.address,
      mapUrl: parsed.data.mapUrl || null,
      description: parsed.data.description || null,
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/weddings/${weddingId}`);
  return { success: true, id: event.id };
}

// ─── Update Event ────────────────────────────────────────────────────

export async function updateEventAction(
  weddingId: string,
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.weddingEvent.findFirst({
    where: { id: eventId, weddingId },
  });
  if (!existing) return { success: false, error: "Không tìm thấy sự kiện" };

  const parsed = updateEventSchema.safeParse({
    title: formData.get("title"),
    startsAt: formData.get("startsAt"),
    address: formData.get("address"),
    mapUrl: formData.get("mapUrl") || undefined,
    description: formData.get("description") || undefined,
    sortOrder: formData.get("sortOrder") ?? existing.sortOrder,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db.weddingEvent.update({
    where: { id: eventId },
    data: {
      title: parsed.data.title,
      startsAt: new Date(parsed.data.startsAt),
      address: parsed.data.address,
      mapUrl: parsed.data.mapUrl || null,
      description: parsed.data.description || null,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath(`/admin/weddings/${weddingId}`);
  return { success: true, id: eventId };
}

// ─── Delete Event ────────────────────────────────────────────────────

export async function deleteEventAction(
  weddingId: string,
  eventId: string,
): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.weddingEvent.findFirst({
    where: { id: eventId, weddingId },
  });
  if (!existing) return { success: false, error: "Không tìm thấy sự kiện" };

  await db.weddingEvent.delete({ where: { id: eventId } });

  revalidatePath(`/admin/weddings/${weddingId}`);
  return { success: true };
}

// ─── Reorder Events ─────────────────────────────────────────────────

export async function reorderEventsAction(
  weddingId: string,
  eventIds: string[],
): Promise<ActionResult> {
  await requireAdminSession();

  const parsed = reorderEventsSchema.safeParse({ eventIds });
  if (!parsed.success) return { success: false, error: "Dữ liệu không hợp lệ" };

  // Verify all events belong to this wedding
  const events = await db.weddingEvent.findMany({
    where: { weddingId, id: { in: parsed.data.eventIds } },
    select: { id: true },
  });
  if (events.length !== parsed.data.eventIds.length) {
    return { success: false, error: "Một số sự kiện không thuộc thiệp này" };
  }

  // Update sortOrder in a transaction
  await db.$transaction(
    parsed.data.eventIds.map((id, index) =>
      db.weddingEvent.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );

  revalidatePath(`/admin/weddings/${weddingId}`);
  return { success: true };
}
