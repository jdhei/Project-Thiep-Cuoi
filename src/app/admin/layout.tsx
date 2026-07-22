import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/session";

export const metadata = {
  title: "Admin · Thiệp Ước",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth — but let the login page render without auth.
  // In Next.js App Router, we can't easily read the pathname in a layout,
  // so we check auth and catch the login page case by wrapping children
  // in a conditional layout (with/without header).
  const cookieStore = cookies();
  const token = cookieStore.get("admin_session")?.value;
  const session = await verifySession(token);

  // Not authenticated → only allow login page to render (no header/chrome).
  if (!session) {
    return <>{children}</>;
  }

  // Authenticated → full admin shell with header.
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            🎀 Thiệp Ước — Admin
          </h1>
          <LogoutButton />
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}

// ─── Server Action logout ────────────────────────────────────────────
function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { cookies } = await import("next/headers");
        cookies().delete("admin_session");
        const { redirect } = await import("next/navigation");
        redirect("/admin/login");
      }}
    >
      <button
        type="submit"
        className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 transition-colors"
      >
        Đăng xuất
      </button>
    </form>
  );
}
