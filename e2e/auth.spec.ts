import { test, expect } from "@playwright/test";

// ─── Helpers ─────────────────────────────────────────────────────────
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@local.test";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
}

// ─── AUTH-08: E2E login / logout ─────────────────────────────────────

test.describe("Admin Auth", () => {
  test("redirects unauthenticated user to login page", async ({ page }) => {
    await page.goto("/admin");
    // Should show login form or redirect to login
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 10_000 });
  });

  test("shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    // At least one validation message should appear
    await expect(page.locator("text=Email không hợp lệ").or(page.locator("text=Vui lòng nhập mật khẩu"))).toBeVisible();
  });

  test("shows generic error for wrong credentials", async ({ page }) => {
    await login(page, "wrong@example.com", "wrongpassword");
    await expect(page.locator("text=Thông tin đăng nhập không đúng")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows generic error for wrong password (same message as wrong email)", async ({ page }) => {
    await login(page, ADMIN_EMAIL, "definitely-wrong-password");
    await expect(page.locator("text=Thông tin đăng nhập không đúng")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("successful login redirects to /admin dashboard", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    // Should see the admin dashboard
    await expect(page.locator("text=Dashboard").or(page.locator("text=Xin chào"))).toBeVisible({
      timeout: 15_000,
    });
    // Should see admin header with logout button
    await expect(page.getByRole("button", { name: /đăng xuất/i })).toBeVisible();
  });

  test("logout clears session and shows login page", async ({ page }) => {
    // First login
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page.getByRole("button", { name: /đăng xuất/i })).toBeVisible({
      timeout: 15_000,
    });

    // Click logout
    await page.getByRole("button", { name: /đăng xuất/i }).click();

    // Should be back at login page
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 10_000 });

    // Verify cannot access /admin without session
    await page.goto("/admin");
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 10_000 });
  });

  test("admin session cookie is httpOnly", async ({ page, context }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page.getByRole("button", { name: /đăng xuất/i })).toBeVisible({
      timeout: 15_000,
    });

    // httpOnly cookies are not accessible via JS
    const jsValue = await page.evaluate(() => document.cookie);
    expect(jsValue).not.toContain("admin_session");

    // But the cookie exists in the context
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "admin_session");
    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie!.httpOnly).toBe(true);
    expect(sessionCookie!.sameSite).toBe("Lax");
  });
});
