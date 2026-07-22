"use client";

import { useState, useTransition, useRef } from "react";
import { deleteMediaAction } from "@/features/weddings/media.actions";
import type { WeddingMedia } from "@prisma/client";

type Props = {
  weddingId: string;
  cover: WeddingMedia | null;
  gallery: WeddingMedia[];
  music: WeddingMedia | null;
};

export function GalleryManager({ weddingId, cover, gallery: initialGallery, music }: Props) {
  const [gallery, setGallery] = useState(initialGallery);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(type: string, file: File) {
    setMessage("Đang upload...");
    const params = new URLSearchParams({ weddingId, type });
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`/api/uploads?${params}`, { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok) {
      setMessage(`Upload thành công: ${type}`);
      window.location.reload();
    } else {
      setMessage(`Lỗi: ${data.error}`);
    }
  }

  async function handleDelete(mediaId: string, type: string) {
    if (!confirm(`Xóa ${type} này?`)) return;
    startTransition(async () => {
      const result = await deleteMediaAction(weddingId, mediaId);
      if (result.success) {
        if (type === "gallery") {
          setGallery((prev) => prev.filter((m) => m.id !== mediaId));
        }
        setMessage("Đã xóa");
        if (type !== "gallery") window.location.reload();
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{message}</div>
      )}

      {/* ── Cover ────────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">Ảnh bìa</h3>
        {cover ? (
          <div className="group relative inline-block">
            <img
              src={`/media/${cover.id}`}
              alt="Cover"
              className="h-48 w-72 rounded-lg object-cover shadow"
            />
            <button
              onClick={() => handleDelete(cover.id, "cover")}
              disabled={isPending}
              className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Xóa
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có ảnh bìa</p>
        )}
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          {cover ? "Thay ảnh bìa" : "Upload ảnh bìa"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload("cover", f);
            }}
          />
        </label>
      </section>

      {/* ── Gallery ──────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">
          Album ảnh ({gallery.length})
        </h3>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {gallery.map((item) => (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={`/media/${item.id}`}
                  alt={item.caption ?? "Gallery"}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => handleDelete(item.id, "gallery")}
                  disabled={isPending}
                  className="absolute right-1 top-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ✕
                </button>
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có ảnh trong album</p>
        )}
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          + Thêm ảnh
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                Array.from(files).forEach((f) => handleUpload("gallery", f));
              }
            }}
          />
        </label>
      </section>

      {/* ── Music ────────────────────────────────────────── */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-gray-700">Nhạc nền</h3>
        {music ? (
          <div className="flex items-center gap-3">
            <audio controls src={`/media/${music.id}`} className="h-10" />
            <span className="text-sm text-gray-500">
              {(music.sizeBytes / 1024 / 1024).toFixed(1)} MB
            </span>
            <button
              onClick={() => handleDelete(music.id, "music")}
              disabled={isPending}
              className="rounded bg-red-100 px-3 py-1 text-xs text-red-600 hover:bg-red-200"
            >
              Xóa
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Chưa có nhạc nền</p>
        )}
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          {music ? "Thay nhạc" : "Upload nhạc"}
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload("music", f);
            }}
          />
        </label>
      </section>
    </div>
  );
}
