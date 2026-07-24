import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { listWeddings, countWeddingsByStatus } from "@/features/weddings/wedding.repository";
import { weddingStatusSchema, type WeddingStatus } from "@/lib/domain";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WeddingActions } from "./WeddingActions";

/** FIX-08 (WED-TASKS-DETAIL 05e): tab lọc danh sách theo trạng thái. */
const FILTER_TABS: { label: string; value: WeddingStatus | null }[] = [
  { label: "Tất cả", value: null },
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Lưu trữ", value: "ARCHIVED" },
];

export default async function WeddingsListPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  await requireAdminSession();

  // Chỉ nhận giá trị trạng thái hợp lệ; ?status rác → coi như "Tất cả"
  const parsed = weddingStatusSchema.safeParse(searchParams?.status?.toUpperCase());
  const activeStatus: WeddingStatus | null = parsed.success ? parsed.data : null;

  const [weddings, counts] = await Promise.all([
    listWeddings(activeStatus ?? undefined),
    countWeddingsByStatus(),
  ]);
  const total = Object.values(counts).reduce((s, n) => s + n, 0);

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

      {/* Tab lọc trạng thái */}
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Lọc theo trạng thái">
        {FILTER_TABS.map((tab) => {
          const isActive = tab.value === activeStatus;
          const count = tab.value === null ? total : (counts[tab.value] ?? 0);
          return (
            <Link
              key={tab.label}
              role="tab"
              aria-selected={isActive}
              href={tab.value ? `/admin/weddings?status=${tab.value}` : "/admin/weddings"}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 rounded-full px-1.5 text-xs ${
                  isActive ? "bg-white/20" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {weddings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">
          <div className="text-4xl mb-3">💌</div>
          <p className="text-gray-500 mb-4">
            {activeStatus && total > 0 ? "Không có thiệp ở trạng thái này" : "Chưa có thiệp nào"}
          </p>
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
