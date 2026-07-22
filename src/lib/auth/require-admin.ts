import { redirect } from "next/navigation";
import { getAdminSession, type AdminSessionPayload } from "./session";

/**
 * Guard for admin pages (Server Components).
 * Call at the top of admin pages/layouts.
 * Redirects to /admin/login if not authenticated.
 */
export async function requireAdminSession(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
