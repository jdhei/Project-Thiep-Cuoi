import { requireAdminSession } from "@/lib/auth/require-admin";

export default async function AdminDashboard() {
  const session = await requireAdminSession();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      <p className="mt-2 text-gray-500">
        Xin chào, <span className="font-medium text-gray-700">{session.email}</span>
      </p>
      <p className="mt-4 text-sm text-gray-400">
        Quản lý thiệp cưới sẽ có ở Giai đoạn 3 (Wedding CRUD).
      </p>
    </div>
  );
}
