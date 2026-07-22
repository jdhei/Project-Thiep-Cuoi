"use client";

import { useRef } from "react";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  variant = "danger",
  onConfirm,
  children,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode; // trigger button
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <span onClick={() => dialogRef.current?.showModal()}>{children}</span>
      <dialog
        ref={dialogRef}
        className="rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/40 max-w-sm w-full"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={async () => {
              await onConfirm();
              dialogRef.current?.close();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
