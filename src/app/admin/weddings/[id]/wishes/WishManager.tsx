"use client";

import { useState, useTransition } from "react";
import {
  updateWishStatusAction,
  deleteWishAction,
} from "@/features/weddings/rsvp.actions";

type Wish = {
  id: string;
  guestName: string;
  content: string;
  status: string;
  createdAt: Date;
};

type Filter = "ALL" | "PENDING" | "APPROVED" | "HIDDEN";

const BADGE: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Chờ duyệt", cls: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Đã duyệt", cls: "bg-green-100 text-green-700" },
  HIDDEN: { label: "Ẩn", cls: "bg-gray-100 text-gray-500" },
};

export function WishManager({
  weddingId,
  initialWishes,
}: {
  weddingId: string;
  initialWishes: Wish[];
}) {
  const [wishes, setWishes] = useState(initialWishes);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered =
    filter === "ALL" ? wishes : wishes.filter((w) => w.status === filter);

  const pendingCount = wishes.filter((w) => w.status === "PENDING").length;

  function handleStatus(id: string, status: "APPROVED" | "HIDDEN") {
    startTransition(async () => {
      const result = await updateWishStatusAction(weddingId, id, status);
      if (result.success) {
        setWishes((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status } : w)),
        );
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Xoá lời chúc này vĩnh viễn?")) return;
    startTransition(async () => {
      const result = await deleteWishAction(weddingId, id);
      if (result.success) {
        setWishes((prev) => prev.filter((w) => w.id !== id));
      }
    });
  }

  function handleApproveAll() {
    const pendingWishes = wishes.filter((w) => w.status === "PENDING");
    if (pendingWishes.length === 0) return;
    if (!confirm(`Duyệt tất cả ${pendingWishes.length} lời chúc đang chờ?`)) return;

    for (const w of pendingWishes) {
      handleStatus(w.id, "APPROVED");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with approve all */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["ALL", "PENDING", "APPROVED", "HIDDEN"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "ALL" ? `Tất cả (${wishes.length})` : `${BADGE[f]?.label} (${wishes.filter((w) => w.status === f).length})`}
            </button>
          ))}
        </div>
        {pendingCount > 0 && (
          <button
            onClick={handleApproveAll}
            disabled={isPending}
            className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            ✓ Duyệt tất cả ({pendingCount})
          </button>
        )}
      </div>

      {/* Wishes list */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Chưa có lời chúc nào.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="rounded-lg border bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{w.guestName}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[w.status]?.cls ?? "bg-gray-100"}`}>
                      {BADGE[w.status]?.label ?? w.status}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600">{w.content}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(w.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {w.status !== "APPROVED" && (
                    <button
                      onClick={() => handleStatus(w.id, "APPROVED")}
                      disabled={isPending}
                      className="text-xs text-green-600 hover:text-green-800 font-medium"
                    >
                      Duyệt
                    </button>
                  )}
                  {w.status !== "HIDDEN" && (
                    <button
                      onClick={() => handleStatus(w.id, "HIDDEN")}
                      disabled={isPending}
                      className="text-xs text-yellow-600 hover:text-yellow-800 font-medium"
                    >
                      Ẩn
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(w.id)}
                    disabled={isPending}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
