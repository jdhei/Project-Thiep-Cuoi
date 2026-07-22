import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { findWeddingById } from "@/features/weddings/wedding.repository";
import { StatusBadge } from "@/components/admin/StatusBadge";

const tabs = [
  { href: "content", label: "Nội dung" },
  { href: "publish", label: "Xuất bản" },
  // Phases 5–7 sẽ thêm: events, gallery, guests, rsvps, wishes
];

export default async function WeddingDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  await requireAdminSession();
  const wedding = await findWeddingById(params.id);
  if (!wedding) notFound();

  return (
    <div>
      {/* Breadcrumb + title */}
      <div className="mb-6">
        <Link href="/admin/weddings" className="text-sm text-blue-600 hover:underline">
          ← Danh sách thiệp
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">
            {wedding.groomName} & {wedding.brideName}
          </h2>
          <StatusBadge status={wedding.status} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          /w/{wedding.slug} · Tạo {new Date(wedding.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={`/admin/weddings/${params.id}/${tab.href}`}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900 transition-colors"
          >
            {tab.label}
          </Link>
        ))}
        <Link
          href={`/preview/${params.id}`}
          target="_blank"
          className="ml-auto rounded-md px-4 py-2 text-sm font-medium text-gray-500 hover:bg-white hover:text-gray-900 transition-colors"
        >
          👁 Xem trước
        </Link>
      </div>

      {children}
    </div>
  );
}
