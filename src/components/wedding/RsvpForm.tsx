"use client";

import { useState } from "react";
import type { RsvpSubmissionInput } from "@/features/weddings/rsvp.schemas";

type Props = {
  slug: string;
  /** GUEST-03: tên gợi sẵn từ mã mời cá nhân */
  presetName?: string;
  /** GUEST-03: mã mời để liên kết RSVP với Guest */
  invitationCode?: string;
  /** GUEST-04: giới hạn số người (mặc định 20) */
  maxPeople?: number;
};
type Status = "idle" | "loading" | "success" | "error";

export function RsvpForm({ slug, presetName, invitationCode, maxPeople = 20 }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [fullName, setFullName] = useState(presetName ?? "");
  const [phone, setPhone] = useState("");
  const [attendance, setAttendance] = useState<RsvpSubmissionInput["attendance"]>("ATTENDING");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/public/weddings/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          attendance,
          numberOfPeople,
          message,
          invitationCode,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Có lỗi xảy ra");
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-gold-soft/40 bg-paper p-6 text-center shadow-soft-sm">
        <div className="text-3xl">🎉</div>
        <p className="mt-2 font-cormorant text-[1.2rem] text-gold-deep">Cảm ơn bạn đã xác nhận!</p>
        <p className="mt-1 text-sm text-muted">Chúng mình rất vui được đón tiếp bạn.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-gold-soft/40 bg-paper p-6 text-left shadow-soft-sm"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Họ tên *</label>
        <input
          type="text"
          required
          minLength={2}
          maxLength={100}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-gold-soft/50 px-3 py-2 text-base outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Số điện thoại</label>
        <input
          type="tel"
          maxLength={20}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-gold-soft/50 px-3 py-2 text-base outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Xác nhận *</label>
        <select
          value={attendance}
          onChange={(e) => {
            const val = e.target.value as RsvpSubmissionInput["attendance"];
            setAttendance(val);
            if (val === "NOT_ATTENDING") setNumberOfPeople(0);
            else if (numberOfPeople === 0) setNumberOfPeople(1);
          }}
          className="w-full rounded-lg border border-gold-soft/50 px-3 py-2 text-base outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="ATTENDING">Sẽ tham dự</option>
          <option value="MAYBE">Chưa chắc chắn</option>
          <option value="NOT_ATTENDING">Không tham dự</option>
        </select>
      </div>

      {attendance !== "NOT_ATTENDING" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Số người tham dự</label>
          <input
            type="number"
            min={1}
            max={maxPeople}
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(Number(e.target.value))}
            className="w-full rounded-lg border border-gold-soft/50 px-3 py-2 text-base outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
          {maxPeople < 20 && (
            <p className="mt-1 text-xs text-muted">Tối đa {maxPeople} người theo thư mời của bạn.</p>
          )}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Lời nhắn</label>
        <textarea
          maxLength={1000}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-gold-soft/50 px-3 py-2 text-base outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-gold px-4 py-2.5 font-medium text-white transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        {status === "loading" ? "Đang gửi..." : "Gửi xác nhận"}
      </button>
    </form>
  );
}
