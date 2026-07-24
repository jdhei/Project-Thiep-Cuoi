# TASKS-status — Tiến độ công việc (Thiệp Ước)

> Theo dõi từng đầu việc. Mã task dùng cho tên nhánh Git.
> Trạng thái: ⬜ chưa làm · 🟡 đang làm · ✅ xong
> Xem `PLAN.md` (giai đoạn) và `SPEC.md` (đặc tả).
> Cập nhật: 2026-07-24 (thêm nhóm FIX — audit & hardening)

**Quy ước nhánh:** `feature/<MÃ>-mô-tả` · ví dụ `feature/AUTH-02-login`
**Commit mẫu:** `feat(rsvp): add idempotent public submission`

---

## P0 — Prototype UI/UX  ✅

| Mã | Việc | TT |
|----|------|----|
| PROTO-01 | Landing: nav, hero, features, steps, templates, pricing, CTA, footer | ✅ |
| PROTO-02 | Thiệp mẫu Classic Gold: phong bì, hero, countdown, story, events, gallery, RSVP, wishes | ✅ |
| PROTO-03 | Animation: ripple, nút nam châm, scroll-reveal, cánh hoa, confetti, lightbox, toast | ✅ |
| PROTO-04 | Tách file: `css/{base,landing,invite}`, `js/{ui,invite}` | ✅ |
| PROTO-05 | Responsive mobile & PC: viewport-fit, input 16px, touch-action, hover:none, ≥44px | ✅ |
| PROTO-06 | Accessibility: aria-label, focus-visible, mở phong bì bằng phím, reduced-motion | ✅ |
| PROTO-07 | Tài liệu SPEC / PLAN / TASKS | ✅ |

---

## SET — Setup (Giai đoạn 1)  ✅

| Mã | Việc | TT |
|----|------|----|
| SET-01 | `create-next-app` (TS, Tailwind, App Router, src-dir, import-alias) | ✅ |
| SET-02 | Cài prisma, @prisma/client, zod, react-hook-form, @hookform/resolvers, bcryptjs, jose, date-fns, qrcode, lucide-react, clsx, tailwind-merge | ✅ |
| SET-03 | Cài dev: vitest, @vitest/coverage-v8, @playwright/test, @types/bcryptjs, prettier | ✅ |
| SET-04 | `.env.example` + `.env.local` (DATABASE_URL, DIRECT_URL, APP_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, SESSION_SECRET, UPLOAD_ROOT, MEDIA_BASE_URL, IP_HASH_SECRET, CF_ACCESS_* optional) | ✅ |
| SET-05 | Scripts package.json (dev/build/start/lint/typecheck/db:*/test/test:e2e) | ✅ |
| SET-06 | Cấu trúc thư mục theo SPEC §3 (app, features, templates, components, lib, types) | ✅ |
| SET-07 | `.gitignore` chặn `storage/uploads`, `.env*`, `dev.db` | ✅ |

---

## DB — Database (Giai đoạn 1)  ✅

> ADR-001: Trạng thái lưu `String` + validate Zod trong `src/lib/domain.ts`.
> ADR-006: Production dùng Supabase PostgreSQL, schema sync bằng `prisma db push`.

| Mã | Việc | TT |
|----|------|----|
| DB-01 | Enum: WeddingStatus / AttendanceStatus / WishStatus (String + Zod, xem ADR-001) | ✅ |
| DB-02 | Model Wedding (+ cờ show*, giftData Json, primaryColor) | ✅ |
| DB-03 | Model WeddingEvent (index weddingId,sortOrder) | ✅ |
| DB-04 | Model WeddingMedia (unique weddingId,path) | ✅ |
| DB-05 | Model Guest (invitationCode unique) | ✅ |
| DB-06 | Model Rsvp (unique weddingId,submissionKey) | ✅ |
| DB-07 | Model Wish (index weddingId,status,createdAt) | ✅ |
| DB-08 | Schema push lên Supabase PostgreSQL (`prisma db push`) | ✅ |
| DB-09 | `db.ts` client singleton | ✅ |
| DB-10 | Seed 1 wedding demo "Quân & Linh" đầy đủ section | ✅ |
| DB-11 | Repository cơ bản (wedding, event, media, rsvp, wish) | ✅ |

---

## DEPLOY — Deploy (xuyên suốt)  ✅

| Mã | Việc | TT |
|----|------|----|
| DEPLOY-01 | Tạo project Vercel `thiepcuoi`, kết nối GitHub repo | ✅ |
| DEPLOY-02 | Cấu hình env vars trên Vercel (DATABASE_URL, DIRECT_URL, SESSION_SECRET, ...) | ✅ |
| DEPLOY-03 | Build & deploy thành công (`prisma generate && next build`) | ✅ |
| DEPLOY-04 | Domain `thiepcuoi-five.vercel.app` verified | ✅ |
| DEPLOY-05 | Tạo Supabase project + push schema | ✅ |
| DEPLOY-06 | Seed data "Quân & Linh" trên production DB | ✅ |

---

## AUTH — Admin Auth (Giai đoạn 2)  ✅

| Mã | Việc | TT |
|----|------|----|
| AUTH-01 | Form `/admin/login` (react-hook-form + zod) | ✅ |
| AUTH-02 | `POST /api/auth/login`: so ADMIN_EMAIL + bcrypt compare | ✅ |
| AUTH-03 | Tạo JWT/session (jose) ký SESSION_SECRET; cookie httpOnly, sameSite=lax | ✅ |
| AUTH-04 | `POST /api/auth/logout` xoá cookie | ✅ |
| AUTH-05 | `requireAdminSession()` + admin layout redirect nếu chưa login | ✅ |
| AUTH-06 | Rate-limit login theo IP (bộ nhớ local) | ✅ |
| AUTH-07 | Lỗi login chung chung; không phân biệt email/mật khẩu | ✅ |
| AUTH-08 | E2E: login thành công / thất bại / logout | ✅ |

> **Lưu ý:** password utilities (`hashPassword`, `verifyPassword`) đã có trong
> `src/lib/auth/password.ts`. Env vars `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` đã
> cấu hình trên Vercel.

---

## WED — Wedding CRUD (Giai đoạn 3)  ✅

| Mã | Việc | TT |
|----|------|----|
| WED-01 | `/admin/weddings` danh sách + trạng thái | ✅ |
| WED-02 | `/admin/weddings/new` tạo (groom/bride/slug/date) → DRAFT | ✅ |
| WED-03 | Validate slug: không dấu, unique, từ cấm (admin/api/login/logout/preview/w/media/static/_next) | ✅ |
| WED-04 | `/admin/weddings/[id]/content` sửa nội dung + cờ show* | ✅ |
| WED-05 | Archive (không xoá thật) | ✅ |
| WED-06 | `/preview/[id]` xem draft (chỉ admin) | ✅ |
| WED-07 | Publish validator: bắt buộc cover (WeddingMedia type=cover, xem FIX-01) + ≥1 event + weddingDate | ✅ |
| WED-08 | Middleware: JWT `admin_session` bắt buộc (FIX-02) + Cloudflare Zero Trust (optional) cho khu vực admin | ✅ |

---

## TPL — Template Public (Giai đoạn 4)  ✅

| Mã | Việc | TT |
|----|------|----|
| TPL-01 | `PublicWeddingDto` + mapper (ẩn phone/ipHash/submissionKey/ghi chú) | ✅ |
| TPL-02 | Port Hero (từ prototype) → component nhận DTO | ✅ |
| TPL-03 | Countdown (client) + Story | ✅ |
| TPL-04 | Events timeline + map link | ✅ |
| TPL-05 | `/w/[slug]` chỉ PUBLISHED; 404 nếu draft/archived | ✅ |
| TPL-06 | Mỗi section check visibility + empty state | ✅ |
| TPL-07 | Test mobile 360px + PC | ✅ |

---

## MED — Events & Media (Giai đoạn 5)  ✅

| Mã | Việc | TT |
|----|------|----|

| MED-01 | CRUD sự kiện + sortOrder | ✅ |
| MED-02 | `POST /api/uploads` (check admin, multipart, MIME, size, UUID) | ✅ |
| MED-03 | Upload cover / gallery / music / gift theo thư mục SPEC §9 | ✅ |
| MED-04 | Rollback: insert DB lỗi → xoá file vừa ghi (chống orphan) | ✅ |
| MED-05 | Route phục vụ file `/media/[id]` | ✅ |
| MED-06 | Sắp xếp gallery + lazy-load/thumbnail | ✅ |
| MED-07 | Music player: không autoplay, bật/tắt | ✅ |

---

## RSVP — RSVP & Wishes (Giai đoạn 6)  ✅

| Mã | Việc | TT |
|----|------|----|
| RSVP-01 | Zod schema RSVP (0–20 người; NOT_ATTENDING→0) | ✅ |
| RSVP-02 | `POST /api/public/weddings/[slug]/rsvp` idempotent (submissionKey) | ✅ |
| RSVP-03 | Hash IP SHA-256 + IP_HASH_SECRET (không lưu IP thô) | ✅ |
| RSVP-04 | Form RSVP client: loading/error/success (tái dùng UX prototype) | ✅ |
| RSVP-05 | `POST .../wishes`: validate, lọc ký tự điều khiển, tạo PENDING | ✅ |
| RSVP-06 | Public chỉ hiển thị Wish APPROVED | ✅ |
| RSVP-07 | `/admin/.../rsvps` lọc attending/not/maybe + tổng số người | ✅ |
| RSVP-08 | `/admin/.../wishes` duyệt/ẩn/xoá | ✅ |

---

## GUEST — Khách mời cá nhân (Giai đoạn 7)  ✅

| Mã | Việc | TT |
|----|------|----|
| GUEST-01 | CRUD Guest | ✅ |
| GUEST-02 | Sinh invitationCode ngẫu nhiên (unique) | ✅ |
| GUEST-03 | Link `?guest=code` tự điền tên | ✅ |
| GUEST-04 | Giới hạn numberOfPeople theo maximumPeople của Guest | ✅ |

---

## UTIL — Hoàn thiện (Giai đoạn 8)  ✅

| Mã | Việc | TT |
|----|------|----|
| UTIL-01 | `GET /api/exports/weddings/[id]/rsvps` CSV UTF-8 | ✅ |
| UTIL-02 | `GET /api/calendar/[slug]` file `.ics` | ✅ |
| UTIL-03 | QR code link thiệp | ✅ |
| UTIL-04 | Metadata chia sẻ / OG image | ✅ |
| UTIL-05 | Rà soát security toàn bộ | ✅ |
| UTIL-06 | E2E regression toàn luồng | ✅ |

---

## TEST — Kiểm thử (xuyên suốt)

### Unit (Vitest)
| Mã | Việc | TT |
|----|------|----|
| TEST-U1 | slug schema: dấu tiếng Việt, khoảng trắng, ký tự đặc biệt, từ cấm | ✅ |
| TEST-U2 | RSVP schema: số âm, >20, NOT_ATTENDING nhưng >0 | ✅ |
| TEST-U3 | Public DTO mapper: không chứa phone/ipHash/submissionKey | ✅ |
| TEST-U4 | Publish validator: thiếu cover/event/date phải lỗi | ✅ |
| TEST-U5 | File validator: sai MIME, quá size, extension kép | ✅ |

### E2E (Playwright) & thủ công
| Mã | Việc | TT |
|----|------|----|
| TEST-E1 | Luồng admin: login→tạo→publish→xem RSVP | ✅ |
| TEST-E2 | Luồng khách: mở thiệp→RSVP→lời chúc | ✅ |
| TEST-M1 | Điện thoại thật (Android Chrome / iPhone Safari), mạng chậm, bàn phím mở form — xem `TEST-M1-mobile-guide.md` | ⬜ |

---

## FIX — Audit & Hardening (2026-07-24)

> Kết quả đợt audit đối chiếu docs ↔ code + rà soát bảo mật độc lập.
> Chi tiết bảo mật: `SECURITY-REVIEW.md`. Đặc tả đã đồng bộ: `SPEC.md` v1.3.

| Mã | Việc | TT |
|----|------|----|
| FIX-01 | Publish validator nhận cover từ `WeddingMedia` (trước kiểm `coverPath` không ai ghi → không thể publish qua luồng upload chuẩn) | ✅ |
| FIX-02 | Middleware verify JWT `admin_session` tập trung cho /admin, /preview, /api/admin, /api/uploads, /api/exports (trước chỉ CF Access — bypass khi không cấu hình) | ✅ |
| FIX-03 | `/media/[id]` chỉ serve thiệp PUBLISHED; admin xem được draft để preview (trước media thiệp nháp bị lộ public) | ✅ |
| FIX-04 | RSVP với mã mời sai → 400 (trước bị bỏ qua thầm lặng, lách được `maximumPeople`) | ✅ |
| FIX-05 | Xuất CSV chống formula injection (`= @`, `+ -` không phải số) | ✅ |
| FIX-06 | Rate-limit public theo `ipHash`: RSVP 10 & wish 5 / 10 phút / thiệp (in-memory, best-effort) | ✅ |
| FIX-07 | Nhóm nhỏ: `giftData` parse an toàn; `invitationCode` dùng CSPRNG; cookie logout thêm `Secure`; `/api/qr` không phản chiếu `?guest=` tuỳ ý; xoá component thừa | ✅ |
| DOCS-01 | Đồng bộ SPEC/SECURITY-REVIEW/DECISIONS/TASKS theo code (submissionKey server-side, giới hạn wish, từ cấm slug, ADR-001) + thêm `CLAUDE.md` vào repo | ✅ |
| FIX-08 | Lọc danh sách wedding theo trạng thái ở `/admin/weddings`: tab Tất cả/Nháp/Đã xuất bản/Lưu trữ kèm số đếm (WED-TASKS-DETAIL 05e) | ✅ |
| FIX-09 | Nút "Tải QR" cá nhân (`?guest=CODE`) cho từng khách ở trang Guests | ✅ |
| FIX-10 | OG image dùng ảnh cover thật (WeddingMedia type=cover, data URI + lớp phủ tối); fallback gradient khi chưa có cover | ✅ |
| FIX-11 | File `.ics` dùng giờ địa phương + `TZID=Asia/Ho_Chi_Minh` kèm block `VTIMEZONE` (util `src/lib/utils/ics.ts` + unit test) | ✅ |
| FIX-12 | Seed sinh `invitationCode` hex chữ thường — lookup luôn `toUpperCase()` nên link cá nhân guest demo không bao giờ khớp → dùng chung `generateInvitationCode` | ✅ |
| FIX-13 | `GuestForm` label không gắn `htmlFor`/`id` (vi phạm a11y, E2E `getByLabel` fail) → thêm `useId` + htmlFor; sửa 2 locator `.or()` mơ hồ trong `e2e/auth.spec.ts` | ✅ |

> Ghi chú: hiệu ứng **mở phong bì + animation** của prototype chưa được port sang
> template React — sẽ xử lý trong giai đoạn nâng cấp animation thiệp (không tính vào FIX).

---

## Tổng kết tiến độ

| Nhóm | Xong | Tổng | % |
|------|------|------|---|
| P0 Prototype | 7 | 7 | 100% |
| SET Setup | 7 | 7 | 100% |
| DB Database | 11 | 11 | 100% |
| DEPLOY | 6 | 6 | 100% |
| AUTH Admin Auth | 8 | 8 | 100% |
| WED Wedding CRUD | 8 | 8 | 100% |
| TPL Template | 7 | 7 | 100% |
| MED Media | 7 | 7 | 100% |
| RSVP | 8 | 8 | 100% |
| GUEST | 4 | 4 | 100% |
| UTIL | 6 | 6 | 100% |
| TEST | 7 | 8 | 88% |
| FIX Audit & Hardening | 14 | 14 | 100% |
| **Tổng** | **100** | **101** | **99%** |
