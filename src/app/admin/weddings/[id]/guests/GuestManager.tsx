"use client";

import { useId, useState, useTransition } from "react";
import {
  createGuestAction,
  updateGuestAction,
  deleteGuestAction,
} from "@/features/weddings/guest.actions";

type Guest = {
  id: string;
  fullName: string;
  phone: string | null;
  invitationCode: string;
  maximumPeople: number;
  personalizedMessage: string | null;
  _count: { rsvps: number };
};

type Props = {
  weddingId: string;
  slug: string;
  guests: Guest[];
};

export function GuestManager({ weddingId, slug, guests }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function guestLink(code: string) {
    return `${origin}/w/${slug}?guest=${code}`;
  }

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      const result = await createGuestAction(weddingId, null, formData);
      if (result.success) {
        setShowNew(false);
        setMessage(`Đã tạo khách mời (mã ${result.invitationCode})`);
        window.location.reload();
      } else {
        setMessage(result.error);
      }
    });
  }

  async function handleUpdate(guestId: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateGuestAction(weddingId, guestId, null, formData);
      if (result.success) {
        setEditing(null);
        setMessage("Đã cập nhật");
        window.location.reload();
      } else {
        setMessage(result.error);
      }
    });
  }

  async function handleDelete(guestId: string) {
    if (!confirm("Xóa khách mời này? (RSVP đã gửi vẫn được giữ lại)")) return;
    startTransition(async () => {
      const result = await deleteGuestAction(weddingId, guestId);
      if (result.success) {
        setMessage("Đã xóa");
        window.location.reload();
      } else {
        setMessage(result.error);
      }
    });
  }

  async function copyLink(code: string) {
    try {
      await navigator.clipboard.writeText(guestLink(code));
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setMessage("Không sao chép được, hãy copy thủ công");
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{message}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Tổng: <strong>{guests.length}</strong> khách mời
        </p>
      </div>

      {guests.length === 0 && !showNew && (
        <p className="text-gray-500">Chưa có khách mời nào.</p>
      )}

      {guests.map((guest) => (
        <div key={guest.id} className="rounded-lg border bg-white p-4 shadow-sm">
          {editing === guest.id ? (
            <GuestForm
              guest={guest}
              onSubmit={(fd) => handleUpdate(guest.id, fd)}
              onCancel={() => setEditing(null)}
              isPending={isPending}
            />
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-800">{guest.fullName}</h4>
                <p className="text-sm text-gray-500">
                  {guest.phone || "—"} · tối đa {guest.maximumPeople} người ·{" "}
                  {guest._count.rsvps > 0 ? (
                    <span className="text-green-600">đã RSVP</span>
                  ) : (
                    <span className="text-gray-400">chưa RSVP</span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono">
                    {guest.invitationCode}
                  </code>
                  <button
                    onClick={() => copyLink(guest.invitationCode)}
                    className="rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    {copied === guest.invitationCode ? "✓ Đã copy link" : "Copy link mời"}
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setEditing(guest.id)}
                  className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(guest.id)}
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
          <h4 className="mb-3 font-semibold text-gray-700">Thêm khách mời</h4>
          <GuestForm
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
          + Thêm khách mời
        </button>
      )}
    </div>
  );
}

function GuestForm({
  guest,
  onSubmit,
  onCancel,
  isPending,
}: {
  guest?: Guest;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  // FIX-13: label phải gắn với input qua htmlFor/id — vừa đúng accessibility
  // (CLAUDE.md yêu cầu), vừa để getByLabel trong E2E hoạt động.
  // useId để id duy nhất khi form render nhiều lần (edit từng khách + form tạo mới).
  const uid = useId();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor={`${uid}-fullName`} className="block text-sm font-medium text-gray-700">
          Họ tên *
        </label>
        <input
          id={`${uid}-fullName`}
          name="fullName"
          defaultValue={guest?.fullName}
          required
          minLength={2}
          maxLength={100}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="VD: Anh Nguyễn Văn A"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${uid}-phone`} className="block text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            defaultValue={guest?.phone ?? ""}
            maxLength={20}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor={`${uid}-maximumPeople`} className="block text-sm font-medium text-gray-700">
            Số người tối đa *
          </label>
          <input
            id={`${uid}-maximumPeople`}
            name="maximumPeople"
            type="number"
            min={1}
            max={20}
            defaultValue={guest?.maximumPeople ?? 1}
            required
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor={`${uid}-personalizedMessage`}
          className="block text-sm font-medium text-gray-700"
        >
          Lời nhắn riêng
        </label>
        <textarea
          id={`${uid}-personalizedMessage`}
          name="personalizedMessage"
          defaultValue={guest?.personalizedMessage ?? ""}
          rows={2}
          maxLength={500}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Hiển thị riêng cho khách này khi mở link mời"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Đang lưu..." : guest ? "Cập nhật" : "Tạo & sinh mã"}
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
