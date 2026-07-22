import { test, expect, type Page } from "@playwright/test";

/**
 * TEST-E1 / UTIL-06: E2E regression luồng admin đầy đủ.
 * login → tạo thiệp → thêm khách mời → kiểm tra tab RSVP & Xuất bản.
 *
 * Chạy: E2E_BASE_URL=<url> ADMIN_EMAIL=.. ADMIN_PASSWORD=.. npx playwright test e2e/admin-flow.spec.ts
 * (Cần Cloudflare Access bypass hoặc chạy local dev không bật CF.)
 */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@local.test";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Mật khẩu").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await expect(page.getByRole("button", { name: /đăng xuất/i })).toBeVisible({
    timeout: 15_000,
  });
}

test.describe("Admin full flow", () => {
  // slug duy nhất mỗi lần chạy để tránh trùng
  const stamp = Date.now().toString(36);
  const slug = `e2e-${stamp}`;
  const groom = "E2E Chú Rể";
  const bride = "E2E Cô Dâu";

  test("login → tạo thiệp → thêm khách mời → kiểm tra RSVP/publish", async ({ page }) => {
    await login(page);

    // ─── Tạo thiệp mới ───────────────────────────────────────────────
    await page.goto("/admin/weddings/new");
    await page.getByLabel(/Tên chú rể/i).fill(groom);
    await page.getByLabel(/Tên cô dâu/i).fill(bride);
    // slug tự sinh — ghi đè bằng slug duy nhất
    const slugInput = page.getByLabel(/Slug/i);
    await slugInput.fill(slug);
    await page.getByRole("button", { name: /Tạo thiệp/i }).click();

    // Sau khi tạo → về danh sách hoặc trang chi tiết; thiệp phải xuất hiện
    await expect(page.getByText(new RegExp(`${groom}|${bride}`)).first()).toBeVisible({
      timeout: 15_000,
    });

    // ─── Mở thiệp vừa tạo ────────────────────────────────────────────
    await page.getByText(new RegExp(`${groom}`)).first().click();
    // Vào được layout chi tiết (có các tab)
    await expect(page.getByRole("link", { name: "Khách mời" })).toBeVisible({
      timeout: 15_000,
    });

    // ─── Thêm khách mời (GUEST-01/02) ───────────────────────────────
    await page.getByRole("link", { name: "Khách mời" }).click();
    await page.getByRole("button", { name: /Thêm khách mời/i }).click();
    await page.getByLabel(/Họ tên/i).fill("Khách E2E");
    await page.getByLabel(/Số người tối đa/i).fill("3");
    await page.getByRole("button", { name: /Tạo & sinh mã/i }).click();
    // Khách mới hiển thị kèm mã mời
    await expect(page.getByText("Khách E2E")).toBeVisible({ timeout: 15_000 });

    // ─── Tab RSVP tải được (RSVP-07) ────────────────────────────────
    await page.getByRole("link", { name: "RSVP" }).click();
    await expect(page.getByText(/Xác nhận tham dự/i)).toBeVisible({ timeout: 15_000 });

    // ─── Tab Xuất bản: hiển thị checklist validate (WED-07) ──────────
    await page.getByRole("link", { name: "Xuất bản" }).click();
    await expect(page.getByText(/Kiểm tra trước khi xuất bản/i)).toBeVisible({
      timeout: 15_000,
    });
    // Thiệp mới chưa có cover → checklist phải báo thiếu ảnh bìa
    await expect(page.getByText(/ảnh bìa/i).first()).toBeVisible();
  });
});
