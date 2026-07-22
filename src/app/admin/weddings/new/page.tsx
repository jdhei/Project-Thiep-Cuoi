"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createWeddingAction } from "@/features/weddings/wedding.actions";
import { slugify } from "@/lib/utils/slug";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white
        hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
    >
      {pending ? "Đang tạo…" : "Tạo thiệp"}
    </button>
  );
}

export default function NewWeddingPage() {
  const [state, formAction] = useFormState(createWeddingAction, null);
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  // Auto-generate slug from names
  useEffect(() => {
    if (!slugManual && (groomName || brideName)) {
      const parts = [groomName, brideName].filter(Boolean);
      setSlug(slugify(parts.join(" ")));
    }
  }, [groomName, brideName, slugManual]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link href="/admin/weddings" className="text-sm text-blue-600 hover:underline">
          ← Danh sách thiệp
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-gray-800">Tạo thiệp mới</h2>
      </div>

      <form action={formAction} className="rounded-xl bg-white p-6 shadow-sm border space-y-4">
        {state && !state.success && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.error}
          </div>
        )}

        {/* Groom */}
        <div>
          <label htmlFor="groomName" className="mb-1 block text-sm font-medium text-gray-700">
            Tên chú rể *
          </label>
          <input
            id="groomName"
            name="groomName"
            type="text"
            required
            value={groomName}
            onChange={(e) => setGroomName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
            placeholder="Nguyễn Văn Quân"
          />
          {state && !state.success && state.fieldErrors?.groomName && (
            <p className="mt-1 text-xs text-red-500">{state.fieldErrors.groomName[0]}</p>
          )}
        </div>

        {/* Bride */}
        <div>
          <label htmlFor="brideName" className="mb-1 block text-sm font-medium text-gray-700">
            Tên cô dâu *
          </label>
          <input
            id="brideName"
            name="brideName"
            type="text"
            required
            value={brideName}
            onChange={(e) => setBrideName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
            placeholder="Trần Thị Linh"
          />
          {state && !state.success && state.fieldErrors?.brideName && (
            <p className="mt-1 text-xs text-red-500">{state.fieldErrors.brideName[0]}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700">
            Slug (đường dẫn) *
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">/w/</span>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors font-mono"
              placeholder="quan-linh"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Chỉ chữ thường không dấu, số, gạch ngang.{" "}
            {slugManual && (
              <button
                type="button"
                onClick={() => setSlugManual(false)}
                className="text-blue-500 hover:underline"
              >
                Tự sinh lại
              </button>
            )}
          </p>
          {state && !state.success && state.fieldErrors?.slug && (
            <p className="mt-1 text-xs text-red-500">{state.fieldErrors.slug[0]}</p>
          )}
        </div>

        {/* Wedding Date */}
        <div>
          <label htmlFor="weddingDate" className="mb-1 block text-sm font-medium text-gray-700">
            Ngày cưới
          </label>
          <input
            id="weddingDate"
            name="weddingDate"
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/admin/weddings"
            className="rounded-lg px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Huỷ
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
