"use client";

import { useState, useTransition } from "react";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  reorderEventsAction,
} from "@/features/weddings/event.actions";
import type { WeddingEvent } from "@prisma/client";

type Props = {
  weddingId: string;
  events: WeddingEvent[];
};

export function EventManager({ weddingId, events: initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createEventAction(weddingId, null, formData);
      if (result.success) {
        setShowNew(false);
        setMessage("Đã tạo sự kiện");
        // Reload
        window.location.reload();
      } else {
        setMessage(result.error);
      }
    });
  }

  async function handleUpdate(eventId: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateEventAction(weddingId, eventId, null, formData);
      if (result.success) {
        setEditing(null);
        setMessage("Đã cập nhật");
        window.location.reload();
      } else {
        setMessage(result.error);
      }
    });
  }

  async function handleDelete(eventId: string) {
    if (!confirm("Xóa sự kiện này?")) return;
    startTransition(async () => {
      const result = await deleteEventAction(weddingId, eventId);
      if (result.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        setMessage("Đã xóa");
      } else {
        setMessage(result.error);
      }
    });
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const newEvents = [...events];
    const tmp = newEvents[index - 1]!;
    newEvents[index - 1] = newEvents[index]!;
    newEvents[index] = tmp;
    setEvents(newEvents);
    startTransition(async () => {
      await reorderEventsAction(weddingId, newEvents.map((e) => e.id));
    });
  }

  async function handleMoveDown(index: number) {
    if (index >= events.length - 1) return;
    const newEvents = [...events];
    const tmp = newEvents[index]!;
    newEvents[index] = newEvents[index + 1]!;
    newEvents[index + 1] = tmp;
    setEvents(newEvents);
    startTransition(async () => {
      await reorderEventsAction(weddingId, newEvents.map((e) => e.id));
    });
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
          {message}
        </div>
      )}

      {events.length === 0 && !showNew && (
        <p className="text-gray-500">Chưa có sự kiện nào.</p>
      )}

      {events.map((event, i) => (
        <div key={event.id} className="rounded-lg border bg-white p-4 shadow-sm">
          {editing === event.id ? (
            <EventForm
              event={event}
              onSubmit={(fd) => handleUpdate(event.id, fd)}
              onCancel={() => setEditing(null)}
              isPending={isPending}
            />
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                <p className="text-sm text-gray-500">
                  {new Date(event.startsAt).toLocaleString("vi-VN")}
                </p>
                <p className="text-sm text-gray-600">{event.address}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleMoveUp(i)}
                  disabled={i === 0 || isPending}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveDown(i)}
                  disabled={i >= events.length - 1 || isPending}
                  className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => setEditing(event.id)}
                  className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={isPending}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showNew ? (
        <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 p-4">
          <h4 className="mb-3 font-semibold text-gray-700">Thêm sự kiện</h4>
          <EventForm
            onSubmit={handleCreate}
            onCancel={() => setShowNew(false)}
            isPending={isPending}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Thêm sự kiện
        </button>
      )}
    </div>
  );
}

function EventForm({
  event,
  onSubmit,
  onCancel,
  isPending,
}: {
  event?: WeddingEvent;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit(fd);
  }

  const defaultDate = event?.startsAt
    ? new Date(event.startsAt).toISOString().slice(0, 16)
    : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Tên sự kiện *</label>
        <input
          name="title"
          defaultValue={event?.title}
          required
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="VD: Lễ vu quy"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Thời gian *</label>
        <input
          name="startsAt"
          type="datetime-local"
          defaultValue={defaultDate}
          required
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Địa chỉ *</label>
        <input
          name="address"
          defaultValue={event?.address}
          required
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="123 Đường ABC, Quận 1, TP.HCM"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Link bản đồ</label>
        <input
          name="mapUrl"
          type="url"
          defaultValue={event?.mapUrl ?? ""}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="https://maps.google.com/..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          name="description"
          defaultValue={event?.description ?? ""}
          rows={2}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Đang lưu..." : event ? "Cập nhật" : "Tạo"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
