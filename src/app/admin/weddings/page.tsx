import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { listWeddings } from "@/features/weddings/wedding.repository";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WeddingActions } from "./WeddingActions";

export default async function WeddingsListPage() {
  await requireAdminSession();
  const weddings = await listWeddings();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Thiệp cưới</h2>
        <Link
          href="/admin/weddings/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Tạo thiệp mới
        </Link>
      </div>

      {weddings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">
          <div className="text-4xl mb-3">💌</div>
          <p className="text-gray-500 mb-4">Chưa có thiệp nào</p>
          <Link
            href="/admin/weddings/new"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Tạo thiệp đầu tiên
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Cặp đôi</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Ngày cưới</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {weddings.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {w.groomName} & {w.brideName}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                      /w/{w.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {w.weddingDate
                      ? new Date(w.weddingDate).toLocaleDateString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <WeddingActions wedding={w} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
