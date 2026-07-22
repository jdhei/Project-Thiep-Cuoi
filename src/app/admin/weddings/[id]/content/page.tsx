"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { updateWeddingAction } from "@/features/weddings/wedding.actions";
import { ToggleSwitch } from "@/components/admin/ToggleSwitch";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white
        hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {pending ? "Đang lưu…" : "Lưu thay đổi"}
    </button>
  );
}

export default function WeddingContentPage() {
  const { id } = useParams<{ id: string }>();
  const boundAction = updateWeddingAction.bind(null, id);
  const [state, formAction] = useFormState(boundAction, null);
  const [wedding, setWedding] = useState<Record<string, unknown> | null>(null);
  const [saved, setSaved] = useState(false);

  // Load wedding data
  useEffect(() => {
    fetch(`/api/admin/weddings/${id}`)
      .then((r) => r.json())
      .then(setWedding)
      .catch(() => null);
  }, [id]);

  // Show saved indicator
  useEffect(() => {
    if (state?.success) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!wedding) {
    return <div className="py-8 text-center text-gray-400">Đang tải...</div>;
  }

  const w = wedding as Record<string, string | boolean | null>;

  return (
    <form action={formAction} className="space-y-6">
      {/* Status messages */}
      {state && !state.success && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div>
      )}
      {saved && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
          ✓ Đã lưu thành công
        </div>
      )}

      {/* Thông tin cơ bản */}
      <section className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cặp đôi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tên chú rể *</label>
            <input
              name="groomName"
              defaultValue={(w.groomName as string) ?? ""}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tên cô dâu *</label>
            <input
              name="brideName"
              defaultValue={(w.brideName as string) ?? ""}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug *</label>
            <input
              name="slug"
              defaultValue={(w.slug as string) ?? ""}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ngày cưới</label>
            <input
              name="weddingDate"
              type="date"
              defaultValue={
                w.weddingDate ? new Date(w.weddingDate as string).toISOString().split("T")[0] : ""
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Nội dung */}
      <section className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nội dung thiệp</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề</label>
            <input
              name="title"
              defaultValue={(w.title as string) ?? ""}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Lễ cưới của Quân & Linh"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Giới thiệu</label>
            <textarea
              name="introduction"
              defaultValue={(w.introduction as string) ?? ""}
              maxLength={2000}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Trân trọng kính mời bạn đến dự..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Câu chuyện tình yêu</label>
            <textarea
              name="loveStory"
              defaultValue={(w.loveStory as string) ?? ""}
              maxLength={5000}
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Chúng mình quen nhau từ..."
            />
          </div>
        </div>
      </section>

      {/* Giao diện */}
      <section className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Giao diện</h3>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Màu chủ đạo</label>
          <div className="flex items-center gap-3">
            <input
              name="primaryColor"
              type="color"
              defaultValue={(w.primaryColor as string) ?? "#8A6D3B"}
              className="h-10 w-14 cursor-pointer rounded border border-gray-300"
            />
            <span className="text-xs text-gray-400 font-mono">
              {(w.primaryColor as string) ?? "#8A6D3B"}
            </span>
          </div>
        </div>
      </section>

      {/* Gift data */}
      <section className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin mừng cưới</h3>
        <textarea
          name="giftData"
          defaultValue={(w.giftData as string) ?? ""}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 font-mono"
          placeholder='{"bank": "Vietcombank", "account": "123456789", "name": "Nguyen Van Quan"}'
        />
        <p className="mt-1 text-xs text-gray-400">JSON format — thông tin chuyển khoản/QR</p>
      </section>

      {/* Visibility toggles */}
      <section className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hiển thị section</h3>
        <div className="divide-y">
          <ToggleSwitch name="showCountdown" label="Đếm ngược" defaultChecked={w.showCountdown as boolean} />
          <ToggleSwitch name="showStory" label="Câu chuyện tình yêu" defaultChecked={w.showStory as boolean} />
          <ToggleSwitch name="showGallery" label="Album ảnh" defaultChecked={w.showGallery as boolean} />
          <ToggleSwitch name="showRsvp" label="RSVP (xác nhận tham dự)" defaultChecked={w.showRsvp as boolean} />
          <ToggleSwitch name="showWishes" label="Sổ lời chúc" defaultChecked={w.showWishes as boolean} />
          <ToggleSwitch name="showGift" label="Mừng cưới" defaultChecked={w.showGift as boolean} />
          <ToggleSwitch name="showMusic" label="Nhạc nền" defaultChecked={w.showMusic as boolean} />
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
