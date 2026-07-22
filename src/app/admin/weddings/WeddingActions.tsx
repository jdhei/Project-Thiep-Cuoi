"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { archiveWeddingAction, unarchiveWeddingAction } from "@/features/weddings/wedding.actions";

type Wedding = { id: string; slug: string; status: string };

export function WeddingActions({ wedding }: { wedding: Wedding }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/weddings/${wedding.id}/content`}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
      >
        Sửa
      </Link>
      <Link
        href={`/preview/${wedding.id}`}
        target="_blank"
        className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
      >
        Xem
      </Link>
      {wedding.status !== "ARCHIVED" ? (
        <ConfirmDialog
          title="Lưu trữ thiệp"
          message="Thiệp sẽ không còn hiển thị công khai. Bạn có thể khôi phục sau."
          confirmLabel="Lưu trữ"
          variant="warning"
          onConfirm={async () => {
            await archiveWeddingAction(wedding.id);
            router.refresh();
          }}
        >
          <button className="rounded-md px-3 py-1.5 text-xs font-medium text-yellow-600 hover:bg-yellow-50 transition-colors">
            Archive
          </button>
        </ConfirmDialog>
      ) : (
        <button
          onClick={async () => {
            await unarchiveWeddingAction(wedding.id);
            router.refresh();
          }}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 transition-colors"
        >
          Khôi phục
        </button>
      )}
    </div>
  );
}
