"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

// ─── RSVP-07: List RSVPs with stats ─────────────────────────────────

export async function getRsvpStats(weddingId: string) {
  await requireAdminSession();

  const rsvps = await db.rsvp.findMany({
    where: { weddingId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      attendance: true,
      numberOfPeople: true,
      message: true,
      createdAt: true,
    },
  });

  const attending = rsvps.filter((r) => r.attendance === "ATTENDING");
  const notAttending = rsvps.filter((r) => r.attendance === "NOT_ATTENDING");
  const maybe = rsvps.filter((r) => r.attendance === "MAYBE");

  return {
    rsvps,
    stats: {
      total: rsvps.length,
      attending: attending.length,
      notAttending: notAttending.length,
      maybe: maybe.length,
      totalPeople: rsvps.reduce((sum, r) => sum + r.numberOfPeople, 0),
      attendingPeople: attending.reduce((sum, r) => sum + r.numberOfPeople, 0),
    },
  };
}

// ─── RSVP-07: Delete RSVP ───────────────────────────────────────────

export async function deleteRsvpAction(
  weddingId: string,
  rsvpId: string,
): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.rsvp.findFirst({
    where: { id: rsvpId, weddingId },
  });
  if (!existing) return { success: false, error: "Không tìm thấy RSVP" };

  await db.rsvp.delete({ where: { id: rsvpId } });
  revalidatePath(`/admin/weddings/${weddingId}/rsvps`);
  return { success: true };
}

// ─── RSVP-08: List Wishes ───────────────────────────────────────────

export async function getWishes(weddingId: string) {
  await requireAdminSession();

  return db.wish.findMany({
    where: { weddingId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      guestName: true,
      content: true,
      status: true,
      createdAt: true,
    },
  });
}

// ─── RSVP-08: Update Wish status ────────────────────────────────────

export async function updateWishStatusAction(
  weddingId: string,
  wishId: string,
  status: "APPROVED" | "HIDDEN",
): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.wish.findFirst({
    where: { id: wishId, weddingId },
  });
  if (!existing) return { success: false, error: "Không tìm thấy lời chúc" };

  await db.wish.update({ where: { id: wishId }, data: { status } });
  revalidatePath(`/admin/weddings/${weddingId}/wishes`);
  return { success: true };
}

// ─── RSVP-08: Delete Wish ───────────────────────────────────────────

export async function deleteWishAction(
  weddingId: string,
  wishId: string,
): Promise<ActionResult> {
  await requireAdminSession();

  const existing = await db.wish.findFirst({
    where: { id: wishId, weddingId },
  });
  if (!existing) return { success: false, error: "Không tìm thấy lời chúc" };

  await db.wish.delete({ where: { id: wishId } });
  revalidatePath(`/admin/weddings/${weddingId}/wishes`);
  return { success: true };
}
