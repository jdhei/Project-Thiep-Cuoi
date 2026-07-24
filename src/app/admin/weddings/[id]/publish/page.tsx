import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { validatePublishReady } from "@/features/weddings/wedding.validators";
import { PublishActions } from "./PublishActions";

export default async function PublishPage({ params }: { params: { id: string } }) {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({
    where: { id: params.id },
    include: {
      events: true,
      // FIX-01: cover được lưu ở WeddingMedia (type="cover") — validator cần media
      media: { where: { type: "cover" }, select: { type: true } },
    },
  });
  if (!wedding) notFound();

  const validation = validatePublishReady(wedding);

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <section className="rounded-xl bg-white p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Kiểm tra trước khi xuất bản</h3>
        <ul className="space-y-3">
          {validation.checks.map((check, i) => (
            <li key={i} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  check.passed
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {check.passed ? "✓" : "✗"}
              </span>
              <span
                className={`text-sm ${
                  check.passed ? "text-gray-700" : "text-red-600 font-medium"
                }`}
              >
                {check.label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Actions */}
      <PublishActions
        weddingId={params.id}
        status={wedding.status}
        slug={wedding.slug}
        canPublish={validation.valid}
        errors={validation.errors}
      />

      {/* UTIL-01/02/03: Tiện ích chia sẻ (chỉ khi đã xuất bản) */}
      {wedding.status === "PUBLISHED" && (
        <section className="rounded-xl bg-white p-6 shadow-sm border">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Tiện ích chia sẻ</h3>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr/${wedding.slug}`}
                alt="QR link thiệp"
                width={160}
                height={160}
                className="rounded-lg border"
              />
              <p className="mt-1 text-xs text-gray-500">Quét để mở thiệp</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`/api/qr/${wedding.slug}`}
                download={`qr-${wedding.slug}.png`}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                ⬇ Tải mã QR (PNG)
              </a>
              <a
                href={`/api/exports/weddings/${params.id}/rsvps`}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                ⬇ Xuất danh sách RSVP (CSV)
              </a>
              <a
                href={`/api/calendar/${wedding.slug}`}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                ⬇ Tải lịch sự kiện (.ics)
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
