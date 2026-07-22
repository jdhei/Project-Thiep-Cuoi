"use client";

import { useState, useTransition } from "react";
import { deleteRsvpAction } from "@/features/weddings/rsvp.actions";

type Rsvp = {
  id: string;
  fullName: string;
  phone: string | null;
  attendance: string;
  numberOfPeople: number;
  message: string | null;
  createdAt: Date;
};

type Stats = {
  total: number;
  attending: number;
  notAttending: number;
  maybe: number;
  totalPeople: number;
  attendingPeople: number;
};

type Filter = "ALL" | "ATTENDING" | "NOT_ATTENDING" | "MAYBE";

const BADGE: Record<string, { label: string; cls: string }> = {
  ATTENDING: { label: "Tham dự", cls: "bg-green-100 text-green-700" },
  NOT_ATTENDING: { label: "Không đến", cls: "bg-red-100 text-red-700" },
  MAYBE: { label: "Chưa chắc", cls: "bg-yellow-100 text-yellow-700" },
};

export function RsvpManager({
  weddingId,
  initialRsvps,
  initialStats,
}: {
  weddingId: string;
  initialRsvps: Rsvp[];
  initialStats: Stats;
}) {
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [stats] = useState(initialStats);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [isPending, startTransition] = useTransition();

  const filtered =
    filter === "ALL" ? rsvps : rsvps.filter((r) => r.attendance === filter);

  function handleDelete(id: string) {
    if (!confirm("Xoá RSVP này?")) return;
    startTransition(async () => {
      const result = await deleteRsvpAction(weddingId, id);
      if (result.success) {
        setRsvps((prev) => prev.filter((r) => r.id !== id));
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Tổng phản hồi" value={stats.total} />
        <StatCard label="Tham dự" value={stats.attending} color="text-green-600" />
        <StatCard label="Không đến" value={stats.notAttending} color="text-red-600" />
        <StatCard label="Tổng người đến" value={stats.attendingPeople} color="text-blue-600" />
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["ALL", "ATTENDING", "NOT_ATTENDING", "MAYBE"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "ALL" ? "Tất cả" : BADGE[f]?.label ?? f}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Chưa có RSVP nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Họ tên</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">SĐT</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Số người</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Lời nhắn</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.fullName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[r.attendance]?.cls ?? "bg-gray-100"}`}>
                      {BADGE[r.attendance]?.label ?? r.attendance}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.numberOfPeople}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate text-gray-500">
                    {r.message || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={isPending}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-gray-800",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  );
}
