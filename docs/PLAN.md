# PLAN — Kế hoạch triển khai (Thiệp Ước)

> Kế hoạch theo giai đoạn, từ prototype tĩnh → MVP Next.js đầy đủ.
> Xem đặc tả tại `SPEC.md`, công việc chi tiết tại `TASKS-status.md`.
> Phiên bản: 1.2 · Cập nhật: 2026-07-22

---

## 0. Hiện trạng

| Hạng mục | Trạng thái |
|----------|-----------|
| Workflow/đặc tả nghiệp vụ | ✅ Có (docx trong repo) |
| **Prototype UI/UX tĩnh** (landing + thiệp mẫu Classic Gold, animation) | ✅ Đã dựng trong `files/` |
| **Project Next.js + Prisma + DB** | ✅ Setup xong, schema trên Supabase PostgreSQL |
| **Template Public** (`/w/[slug]`) | ✅ Hero, Countdown, Story, Events, Wishes — đã port |
| **Deploy Vercel** | ✅ `thiepcuoi-five.vercel.app` (READY) |
| **Supabase PostgreSQL** | ✅ Schema + seed data "Quân & Linh" |
| Admin Auth (login/logout/session) | ✅ Hoàn thành (8/8 task, E2E đã có) |
| Admin CRUD thiệp | ⬜ Chưa bắt đầu |
| Upload/media, RSVP/wishes API | ⬜ Chưa bắt đầu |

**Chiến lược:** dùng prototype tĩnh làm bản thiết kế chốt cho template `classic-gold`,
sau đó dựng backend Next.js quanh nó theo 8 giai đoạn dưới đây.

---

## 1. Nguyên tắc thực thi
- **Vertical slice trước:** làm xuyên suốt 1 luồng tối thiểu (login → tạo thiệp → publish → RSVP) rồi mới mở rộng.
- **Mobile-first:** mọi màn hình test 360px trước desktop.
- **Definition of Done** áp dụng cho mọi task (xem cuối file).
- Mỗi giai đoạn kết thúc bằng: `lint` + `typecheck` + `test` + `build` pass.

---

## 2. Các giai đoạn

### Giai đoạn 0 — Chốt sản phẩm  ✅
- Chốt template Classic Gold, danh sách section, dữ liệu từng section.
- Chốt route, trạng thái thiệp, các trường DB.
- Tạo bộ dữ liệu demo hoàn chỉnh để test.
- **Deliverable:** SPEC.md, prototype UI (đã có).

### Giai đoạn 1 — Project & Database  ✅
- `create-next-app` (TS, Tailwind, App Router, src-dir); cài Prisma/Zod/…
- Viết `schema.prisma` + đẩy schema lên Supabase PostgreSQL (`prisma db push`).
- Seed 1 wedding demo "Quân & Linh".
- `db` client singleton + repository cơ bản.
- **Deliverable:** project chạy, DB có dữ liệu demo, deploy Vercel thành công.

### Giai đoạn 2 — Admin Auth  ✅
- Login/logout; session cookie httpOnly ký bằng `SESSION_SECRET`.
- `requireAdminSession()` bảo vệ `/admin/*` và API admin.
- Rate-limit login theo IP (5 lần / 15 phút).
- E2E login/logout (Playwright).
- **Deliverable:** admin đăng nhập được, route được bảo vệ.

### Giai đoạn 3 — Wedding CRUD  ⬜ ← **tiếp theo**
- Danh sách / tạo mới / sửa thông tin / archive.
- Validate slug (unique, từ cấm, không dấu).
- Trang preview riêng cho admin (`/preview/[id]`).
- **Deliverable:** quản lý thiệp ở trạng thái draft.

### Giai đoạn 4 — Template Public  🟡 (5/7 task xong)
- `PublicWeddingDto` + mapper (không lộ dữ liệu nội bộ).
- Port prototype Classic Gold → component Next: Hero, Countdown, Story, Events.
- `/w/[slug]` chỉ nhận PUBLISHED; test mobile & empty state.
- **Còn lại:** TPL-06 (visibility + empty state), TPL-07 (test mobile 360px + PC).
- **Deliverable:** thiệp public hiển thị từ DB.

### Giai đoạn 5 — Events & Media  ⬜
- CRUD sự kiện; upload cover/gallery/music; sắp xếp gallery.
- Xoá file không để orphan (rollback khi lỗi DB).
- **Deliverable:** thiệp có ảnh, nhạc, nhiều sự kiện.

### Giai đoạn 6 — RSVP & Lời chúc  ⬜
- Public endpoint RSVP (idempotent) + wishes (PENDING).
- Form có trạng thái loading/error/success (tái dùng UX prototype).
- Dashboard lọc RSVP; duyệt/ẩn/xoá lời chúc.
- **Deliverable:** khách gửi RSVP/lời chúc, admin quản lý.

### Giai đoạn 7 — Khách mời cá nhân  ⬜
- CRUD Guest; sinh `invitationCode` ngẫu nhiên.
- Link `?guest=code` tự điền tên; giới hạn số người theo Guest.
- **Deliverable:** link cá nhân hoá hoạt động.

### Giai đoạn 8 — Hoàn thiện  ⬜
- CSV export; file `.ics`; QR link; metadata chia sẻ (OG image).
- Rà soát security; E2E regression toàn luồng.
- **Deliverable:** đạt "Tiêu chí hoàn thành MVP" trong SPEC §11.

---

## 3. Vertical slice đầu tiên (làm ngay sau GĐ 2–3)
1. Admin login → 2. Tạo wedding "Quân & Linh" → 3. Nhập ngày cưới + 1 sự kiện →
4. Template chỉ Hero + Event → 5. Preview draft → 6. Publish →
7. Mở `/w/quan-linh` không đăng nhập → 8. Gửi RSVP → 9. Admin thấy RSVP.

**Sprint đầu KHÔNG làm:** gallery nhiều ảnh, nhạc, QR, guest link, CSV, OG image, hiệu ứng phức tạp.

---

## 4. Mốc (Milestones)

| Mốc | Bao gồm | Kết quả | Trạng thái |
|-----|---------|---------|------------|
| **M0** Design freeze | GĐ 0 | Prototype + SPEC chốt | ✅ |
| **M1** Skeleton | GĐ 1 + Deploy | Project + DB + Vercel + Supabase | ✅ |
| **M1.5** Template port | GĐ 4 (rút gọn) | Thiệp public từ DB | 🟡 |
| **M2** Auth + CRUD | GĐ 2–3 | Login → tạo → publish xuyên suốt | 🟡 (Auth ✅, CRUD ⬜) |
| **M3** Content-rich | GĐ 5–6 | Media + RSVP/wishes đầy đủ | ⬜ |
| **M4** MVP done | GĐ 7–8 | Guest link, CSV, ICS, QR, security | ⬜ |

> **Lưu ý:** GĐ 4 (Template Public) được làm trước GĐ 2–3 (Auth/CRUD) vì port UI
> prototype sang Next.js component không phụ thuộc admin. Auth/CRUD sẽ làm tiếp.

---

## 5. Hạ tầng hiện tại

| Dịch vụ | Chi tiết |
|---------|---------|
| **Vercel** | Project `thiepcuoi` · Domain `thiepcuoi-five.vercel.app` · Auto-deploy từ `main` |
| **Supabase** | Project ref `jqrzpegvwzinvspsgiaj` · Region `ap-southeast-2` · PostgreSQL |
| **Schema sync** | `prisma db push` (không dùng `prisma migrate`, không có `_prisma_migrations`) |
| **Env vars** | DATABASE_URL, DIRECT_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, IP_HASH_SECRET, APP_URL, UPLOAD_ROOT |

---

## 6. Rủi ro & Giảm thiểu

| Rủi ro | Giảm thiểu |
|--------|-----------|
| File orphan khi upload lỗi | Rollback xoá file khi insert DB thất bại; test file validator |
| Lộ dữ liệu nội bộ ra public | Bắt buộc qua `PublicWeddingDto` + unit test mapper |
| RSVP trùng lặp | `submissionKey` idempotent + unique index |
| Autoplay nhạc bị chặn | Chỉ phát sau tương tác người dùng (đã làm ở prototype) |
| Vỡ layout mobile | Test 360px mỗi giai đoạn; CSS mobile-first |
| Supabase connection pooling | Dùng `directUrl` cho migration/push, `DATABASE_URL` cho runtime |
| Vercel cold start | Prisma engine bundled; connection pool qua Supabase pooler |

---

## 7. Definition of Done (mọi task)
- [ ] Chạy đúng happy path.
- [ ] Có xử lý lỗi & empty state.
- [ ] Server validate dữ liệu (Zod).
- [ ] Route admin kiểm tra session.
- [ ] Không lộ dữ liệu nội bộ.
- [ ] `typecheck` + `lint` pass.
- [ ] Có test phù hợp.
- [ ] `build` production pass.
- [ ] Không commit secret / file upload.

---

## 8. Sau MVP (backlog)
Ảnh lên Supabase Storage / R2 · tài khoản khách tự chỉnh · nhiều template ·
gói dịch vụ & hạn dùng · thanh toán online · tên miền riêng · chuyển sang
`prisma migrate` cho quản lý migration chặt hơn.
