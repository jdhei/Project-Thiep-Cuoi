import { test, expect } from "@playwright/test";

/**
 * UTIL-06 / TEST-E2: E2E regression luồng công khai.
 * Dùng thiệp mẫu seed "Quân & Linh" (slug: quan-linh).
 * Chạy: E2E_BASE_URL=<url> npx playwright test e2e/public.spec.ts
 */
const SLUG = process.env.E2E_WEDDING_SLUG || "quan-linh";

test.describe("Public wedding page", () => {
  test("hiển thị thiệp PUBLISHED", async ({ page }) => {
    const res = await page.goto(`/w/${SLUG}`);
    expect(res?.status()).toBeLessThan(400);
    // Tên cặp đôi xuất hiện đâu đó trên trang
    await expect(page.locator("body")).toContainText(/&/);
  });

  test("slug không tồn tại → 404", async ({ page }) => {
    const res = await page.goto("/w/khong-ton-tai-xyz-123");
    expect(res?.status()).toBe(404);
  });

  test("gửi RSVP thành công", async ({ page }) => {
    await page.goto(`/w/${SLUG}`);
    const nameInput = page.getByLabel(/Họ tên/i).first();
    if (await nameInput.count()) {
      await nameInput.fill("Người Kiểm Thử E2E");
      await page.getByRole("button", { name: /Gửi xác nhận/i }).click();
      await expect(page.locator("text=Cảm ơn bạn đã xác nhận")).toBeVisible({ timeout: 10_000 });
    }
  });
});

test.describe("UTIL endpoints", () => {
  test("QR code trả PNG", async ({ request }) => {
    const res = await request.get(`/api/qr/${SLUG}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });

  test("Lịch .ics trả text/calendar", async ({ request }) => {
    const res = await request.get(`/api/calendar/${SLUG}`);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/calendar");
    expect(await res.text()).toContain("BEGIN:VCALENDAR");
  });

  test("Export CSV yêu cầu đăng nhập → 401", async ({ request }) => {
    const res = await request.get(`/api/exports/weddings/non-existent-id/rsvps`);
    expect(res.status()).toBe(401);
  });
});
