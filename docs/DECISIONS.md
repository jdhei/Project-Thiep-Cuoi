# DECISIONS — Quyết định kiến trúc (ADR rút gọn)

Ghi lại các quyết định lệch so với tài liệu gốc và lý do.

## ADR-001: Không dùng Prisma `enum` với SQLite → giữ String + Zod cho cả PostgreSQL
**Bối cảnh:** SPEC dùng enum (`WeddingStatus`...) và `giftData Json`. Connector
SQLite của Prisma không hỗ trợ `enum` và `Json` (lỗi P1012).
**Quyết định:** Lưu các trạng thái dạng `String`, `giftData` dạng JSON-text (`String`).
Ràng buộc kiểu tại tầng app bằng Zod trong `src/lib/domain.ts` (single source of truth).
**Hệ quả:** Tương thích cả SQLite (local dev) và PostgreSQL (production) mà không cần 2 schema.
Khi cần có thể nâng thành enum PostgreSQL thật (migration riêng).
**Cập nhật 2026-07-24:** Dự án đã chạy hẳn trên PostgreSQL (ADR-006) — PostgreSQL hỗ trợ
enum/Json native, nên lý do "SQLite không hỗ trợ" không còn. Việc **giữ String + Zod là
lựa chọn chủ động** (đơn giản, không cần migration, tương thích dữ liệu cũ), không phải
ràng buộc kỹ thuật.

## ADR-002: Tailwind CSS v3 (không v4)
**Quyết định:** Dùng Tailwind v3 + `tailwind.config.ts` để port bảng màu prototype
(ivory/cream/gold/rose/sage) và cấu hình rõ ràng, ổn định.

## ADR-003: Next.js 14 (App Router) thay vì 15
**Quyết định:** Chọn dòng 14.2.x (bản vá bảo mật mới nhất) cho ổn định API `params`
đồng bộ và hệ sinh thái test. Có thể nâng 15 sau khi MVP ổn định.

## ADR-004: Giữ prototype ở gốc repo (không xoá)
Theo yêu cầu "không xoá prototype cũ". Prototype gồm `index.html`, `css/`, `js/` ở gốc
repo. Các file này không phải `.ts/.tsx` và `eslint` chỉ quét
`src/` nên không ảnh hưởng typecheck/lint của app.

## ADR-005: Vị trí build & push
Build tại `/home/user/repo` (đĩa cục bộ) do filesystem mạng không hỗ trợ vài thao tác.
Đẩy source lên GitHub qua connector. `node_modules`, `.env*`, `dev.db`, file upload đều
bị `.gitignore`.

## ADR-006: Supabase PostgreSQL thay vì SQLite cho production
**Bối cảnh:** SPEC ban đầu dùng SQLite local cho nhanh. Tuy nhiên deploy lên Vercel cần
DB hosted — SQLite không phù hợp serverless (file-based, mất dữ liệu mỗi cold start).
**Quyết định:** Chuyển sang **Supabase PostgreSQL** (region `ap-southeast-2`) cho production.
Schema Prisma đổi `provider = "postgresql"` + thêm `directUrl` cho connection pooling.
DB được khởi tạo bằng `prisma db push` (không dùng `prisma migrate`).
**Hệ quả:**
- Env vars production: `DATABASE_URL` (pooled) + `DIRECT_URL` (direct connection).
- `_prisma_migrations` không tồn tại — schema sync bằng `db push`.
- Có thể chuyển sang `prisma migrate` khi cần quản lý migration chặt hơn.

## ADR-007: Deploy trên Vercel
**Bối cảnh:** Cần hosting serverless tương thích Next.js, CI/CD tự động từ GitHub.
**Quyết định:** Deploy trên **Vercel** (project `thiepcuoi`).
- Domain: `thiepcuoi-five.vercel.app`
- Build command: `prisma generate && next build`
- Env vars: DATABASE_URL, DIRECT_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH,
  IP_HASH_SECRET, APP_URL, UPLOAD_ROOT — tất cả đặt ở Vercel Environment Variables (sensitive).
- Auto-deploy khi push lên `main`.

## ADR-008: Repo chính chuyển sang Project-Thiep-Cuoi
**Bối cảnh:** Repo ban đầu `jdhei/thiepcuoi` dùng làm nơi phát triển.
Cần repo chính thức với tên rõ ràng hơn để quản lý dài hạn.
**Quyết định:** Chuyển toàn bộ source sang `jdhei/Project-Thiep-Cuoi`.
Vercel project `thiepcuoi` vẫn deploy từ `thiepcuoi-five.vercel.app`.
**Hệ quả:** Cần cập nhật Vercel Git integration nếu muốn auto-deploy từ repo mới.

## ADR-009: Playwright E2E cho Auth
**Quyết định:** Dùng Playwright cho E2E test auth flow (login/logout/session).
Config auto-start dev server khi chạy local. Trên CI dùng `E2E_BASE_URL`.
Test cases: redirect chưa login, validation, sai credentials, login thành công,
logout, kiểm tra httpOnly cookie.

## ADR-010: Middleware verify JWT tập trung + siết quyền media (Audit 2026-07-24)
**Bối cảnh:** Đợt audit 2026-07-24 phát hiện: middleware chỉ kiểm Cloudflare Access
(bypass hoàn toàn khi không cấu hình `CF_ACCESS_*`), bảo vệ admin phụ thuộc 100% vào
guard đặt tay trong từng page/route; media của thiệp DRAFT/ARCHIVED truy cập được
public qua `/media/[id]`; publish validator kiểm `coverPath` — trường không được luồng
upload ghi → không thể publish.
**Quyết định:**
1. Middleware verify JWT `admin_session` tập trung cho `/admin/*` (trừ `/admin/login`),
   `/preview/*`, `/api/admin/*`, `/api/uploads`, `/api/exports/*`. Page routes redirect
   về `/admin/login?redirect=...`, API routes trả 401 JSON. CF Access giữ làm lớp phụ
   optional. Guard trong từng page/route GIỮ NGUYÊN (defense-in-depth).
2. `/media/[id]` chỉ serve file của thiệp `PUBLISHED`; nếu chưa publish thì yêu cầu
   session admin (phục vụ `/preview/[id]`), người ngoài nhận 404. Cache: published =
   immutable 1 năm; draft = `private, no-store`.
3. Publish validator nhận cover từ `WeddingMedia` (type=`cover`); `Wedding.coverPath`
   chỉ còn là legacy fallback.
**Hệ quả:** Route admin mới được bảo vệ mặc định (không phụ thuộc nhớ/quên gọi guard);
preview vẫn xem được media thiệp nháp; các luồng public không đổi hành vi với thiệp
đã publish.
