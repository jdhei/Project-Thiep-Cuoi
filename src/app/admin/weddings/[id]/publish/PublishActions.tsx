"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishWeddingAction, unpublishWeddingAction } from "@/features/weddings/wedding.actions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function PublishActions({
  weddingId,
  status,
  slug,
  canPublish,
  errors,
}: {
  weddingId: string;
  status: string;
  slug: string;
  canPublish: boolean;
  errors: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [justPublished, setJustPublished] = useState(false);

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/w/${slug}`;

  async function handlePublish() {
    setLoading(true);
    setActionError(null);
    const result = await publishWeddingAction(weddingId);
    if (result.success) {
      setJustPublished(true);
      router.refresh();
    } else {
      setActionError(result.error);
    }
    setLoading(false);
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm border space-y-4">
      {/* Errors */}
      {!canPublish && errors.length > 0 && status !== "PUBLISHED" && (
        <div className="rounded-lg bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700 mb-1">Chưa đủ điều kiện xuất bản:</p>
          <ul className="list-disc list-inside text-sm text-red-600">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {actionError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{actionError}</div>
      )}

      {/* Published info */}
      {(status === "PUBLISHED" || justPublished) && (
        <div className="rounded-lg bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-700 mb-2">🎉 Thiệp đã được xuất bản!</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-white px-3 py-1.5 text-sm border text-gray-700 truncate">
              {publicUrl}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="rounded-md bg-green-200 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-300 transition-colors whitespace-nowrap"
            >
              Copy
            </button>
            <a
              href={`/w/${slug}`}
              target="_blank"
              className="rounded-md bg-green-200 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-300 transition-colors whitespace-nowrap"
            >
              Mở ↗
            </a>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {status !== "PUBLISHED" && (
          <button
            type="button"
            disabled={!canPublish || loading}
            onClick={handlePublish}
            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white
              hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang xuất bản…" : "Xuất bản thiệp"}
          </button>
        )}

        {status === "PUBLISHED" && (
          <ConfirmDialog
            title="Gỡ xuất bản"
            message="Thiệp sẽ không còn hiển thị công khai. Trạng thái chuyển về Nháp."
            confirmLabel="Gỡ xuất bản"
            variant="warning"
            onConfirm={async () => {
              await unpublishWeddingAction(weddingId);
              router.refresh();
            }}
          >
            <button className="rounded-lg bg-yellow-100 px-6 py-2.5 text-sm font-medium text-yellow-700 hover:bg-yellow-200 transition-colors">
              Gỡ xuất bản
            </button>
          </ConfirmDialog>
        )}
      </div>
    </section>
  );
}
