"use client";

import { useState } from "react";

type Props = { slug: string };
type Status = "idle" | "loading" | "success" | "error";

export function WishForm({ slug }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [guestName, setGuestName] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/public/weddings/${slug}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Có lỗi xảy ra");
      }
      setStatus("success");
      setGuestName("");
      setContent("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      {status === "success" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700">
          🎉 Cảm ơn lời chúc! Lời chúc sẽ hiển thị sau khi được duyệt.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-3 rounded-2xl border border-gold-soft/40 bg-paper p-5 text-left shadow-soft-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Tên của bạn *</label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full rounded-lg border border-gold-soft/50 px-3 py-2 text-base outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Lời chúc *</label>
          <textarea
            required
            minLength={1}
            maxLength={2000}
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-gold-soft/50 px-3 py-2 text-base outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>

        {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-gold px-4 py-2.5 font-medium text-white transition-colors hover:bg-gold-deep disabled:opacity-50"
        >
          {status === "loading" ? "Đang gửi..." : "Gửi lời chúc"}
        </button>
      </form>
    </div>
  );
}
