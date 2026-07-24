# SPEC — Dịch vụ Thiệp Cưới Online (Thiệp Ước)

> Đặc tả sản phẩm. Nguồn tham chiếu: `docs/Workflow_MVP_Dich_Vu_Thiep_Cuoi_Online.docx`.
> Phiên bản: 1.3 · Cập nhật: 2026-07-24 (đồng bộ theo code sau đợt audit — code là nguồn sự thật)
> **Repo chính:** `jdhei/Project-Thiep-Cuoi` | **Live:** https://thiepcuoi-five.vercel.app

---

## 1. Tầm nhìn & Mục tiêu

Cho phép **quản trị viên** tạo và quản lý nhiều thiệp cưới, mỗi thiệp có link riêng
(`/w/[slug]`). **Khách mời** mở thiệp không cần đăng nhập, xác nhận tham dự (RSVP) và
gửi lời chúc. Quản trị viên xem RSVP, duyệt lời chúc và xuất CSV.

**Nguyên tắc:** code nhanh → test trên localhost → sớm tạo thiệp thật cho khách.

### 1.1 Trong phạm vi (MVP)
- Admin đăng nhập, CRUD thiệp, sự kiện, media.
- Trang thiệp công khai responsive (mobile-first, test từ 360px).
- RSVP + sổ lời chúc (duyệt trước khi hiển thị).
- Đếm ngược, bản đồ, tải `.ics`, nhạc nền bật/tắt.
- Xuất CSV danh sách RSVP; link khách mời cá nhân hoá.
- Lưu dữ liệu trên **Supabase PostgreSQL**; ảnh local trong giai đoạn dev.

### 1.2 Ngoài phạm vi (cố ý chưa làm)
- Tài khoản cho cô dâu/chú rể tự chỉnh; đăng ký công khai.
- Thanh toán online, đơn hàng, mã giảm giá, hoá đơn.
- Gói dịch vụ tự động, giới hạn ảnh/hạn dùng.
- Multi-tenant/RLS phức tạp; subdomain/custom domain.
- Trình kéo-thả tự do kiểu Canva; gửi email/SMS/Zalo tự động.

---

## 2. Vai trò người dùng

| Vai trò | Quyền |
|---------|-------|
| **Admin** | Đăng nhập; CRUD thiệp/sự kiện/media/khách; xem RSVP; duyệt lời chúc; publish/archive; xuất CSV |
| **Khách mời** | Mở thiệp công khai (không đăng nhập); gửi RSVP; gửi lời chúc; tải `.ics` |

---

## 3. Kiến trúc & Công nghệ

### 3.1 Stack
- **Framework:** Next.js 14 (App Router, TypeScript, `--src-dir`). Xem ADR-003.
- **UI:** TailwindCSS v3, lucide-react, clsx, tailwind-merge. Xem ADR-002.
- **DB:** Supabase PostgreSQL (region `ap-southeast-2`). Xem ADR-006.
- **ORM:** Prisma (`prisma db push` cho schema sync). Xem ADR-006.
- **Validate:** Zod (mọi Route Handler & Server Action).
- **Form:** react-hook-form + @hookform/resolvers.
- **Auth:** bcryptjs (hash mật khẩu) + jose (JWT/session cookie httpOnly).
- **Tiện ích:** date-fns, qrcode.
- **Test:** Vitest (unit), Playwright (E2E).
- **Deploy:** Vercel (`thiepcuoi-five.vercel.app`). Xem ADR-007.

### 3.2 Prototype (đã có trong gốc repo)
Bản demo tĩnh (HTML/CSS/JS thuần) để chốt UX/UI & animation, chưa có backend:
```
index.html          # landing + overlay thiệp mẫu
css/{base,landing,invite}.css
js/{ui,invite}.js
```
Prototype này là **đầu vào thiết kế** cho template `classic-gold` khi lên Next.js
(các file nằm ở gốc repo, xem thêm ADR-004).

### 3.3 Sơ đồ request
```
Trình duyệt
 ├─ /admin/*   → yêu cầu đăng nhập admin (CRUD thiệp/sự kiện, upload, xem RSVP, duyệt lời chúc)
 ├─ /w/[slug]  → trang thiệp công khai (đọc dữ liệu published, gửi RSVP, gửi lời chúc)
 └─ Route Handler / Server Action → Zod validate → Service → Prisma → Supabase PostgreSQL
```

### 3.4 Nguyên tắc code
- Page/component **không** gọi Prisma trực tiếp → qua service/repository.
- Route Handler & Server Action **luôn** validate lại bằng Zod.
- Trang công khai chỉ trả dữ liệu cần hiển thị (không lộ ghi chú nội bộ, danh sách khách).
- Không lưu HTML người dùng nhập; chỉ text thuần / JSON có cấu trúc.
- Không lưu file upload trong `public/`; dùng `storage/uploads` (không commit Git).
- Xoá bản ghi ảnh phải xoá file vật lý; ghi DB lỗi sau upload → rollback xoá file.

---

## 4. Trạng thái thiệp
```
draft ──publish──▶ published ──archive──▶ archived
  ▲                    │                     │
  └────── về draft để chỉnh & kiểm tra ──────┘
```

---

## 5. Mô hình dữ liệu (Prisma → Supabase PostgreSQL)

**Trạng thái (String + Zod):** `WeddingStatus{DRAFT,PUBLISHED,ARCHIVED}` · `AttendanceStatus{ATTENDING,NOT_ATTENDING,MAYBE}` · `WishStatus{PENDING,APPROVED,HIDDEN}`

| Bảng | Trường chính |
|------|--------------|
| **Wedding** | id, slug*(unique)*, status, groomName, brideName, weddingDate, title, introduction, loveStory, coverPath, musicPath, primaryColor, show* (countdown/story/gallery/rsvp/wishes/gift/music), giftData(JSON-text), timestamps |
| **WeddingEvent** | id, weddingId, title, startsAt, address, mapUrl, description, sortOrder |
| **WeddingMedia** | id, weddingId, type(cover/gallery/music/gift), path, mimeType, sizeBytes, caption, sortOrder · unique(weddingId,path) |
| **Guest** | id, weddingId, fullName, phone, invitationCode*(unique)*, maximumPeople, personalizedMessage |
| **Rsvp** | id, weddingId, guestId?, fullName, phone, attendance, numberOfPeople, message, submissionKey, ipHash · unique(weddingId,submissionKey) |
| **Wish** | id, weddingId, guestName, content, status, ipHash, createdAt |

> Schema đã được push lên Supabase PostgreSQL và xác nhận khớp 100% với `schema.prisma`.

### 5.1 Quy tắc dữ liệu
- `slug`: chỉ chữ thường không dấu, số, gạch ngang; unique; cấm từ khoá
  `admin / api / login / logout / preview / w / media / static / _next`
  (danh sách đầy đủ trong `src/lib/utils/slug.ts` — nguồn sự thật).
- `numberOfPeople`: 0–20; nếu `NOT_ATTENDING` ép về 0.
- 1 `submissionKey` → 1 RSVP / 1 wedding (idempotent). **`submissionKey` do SERVER sinh**
  (xem §7.1), client không gửi và không bao giờ nhìn thấy giá trị này.
- Lời chúc mặc định `PENDING`, không hiển thị công khai trước duyệt.
- Không xoá wedding thật ở UI; dùng `ARCHIVED`.

---

## 6. Route & Màn hình

### 6.1 Admin (cần session)
`/admin/login` · `/admin` · `/admin/weddings` · `/admin/weddings/new`
`/admin/weddings/[id]` → `content` · `events` · `gallery` · `guests` · `rsvps` · `wishes` · `publish`

### 6.2 Public & API
- `/w/[slug]` (chỉ PUBLISHED) · `/preview/[id]` (admin xem draft)
- `GET  /media/[id]` (file upload; chỉ thiệp PUBLISHED — admin xem được cả draft để preview)
- `POST /api/auth/login` · `POST /api/auth/logout`
- `POST /api/uploads` (admin)
- `POST /api/public/weddings/[slug]/rsvp`
- `POST /api/public/weddings/[slug]/wishes`
- `GET  /api/calendar/[slug]` (.ics)
- `GET  /api/qr/[slug]` (PNG; hỗ trợ `?guest=CODE` — chỉ nhúng khi mã tồn tại thật)
- `GET  /api/exports/weddings/[id]/rsvps` (CSV UTF-8, admin)
- `GET  /api/admin/weddings/check-slug` (admin — kiểm tra slug khả dụng)

---

## 7. Đặc tả API chính

### 7.1 RSVP — `POST /api/public/weddings/[slug]/rsvp`
```json
{ "invitationCode":"optional", "fullName":"Nguyễn Văn A", "phone":"09...",
  "attendance":"ATTENDING", "numberOfPeople":2, "message":"..." }
```
Giới hạn: `fullName` 2–100 ký tự · `message` ≤1000 ký tự · `invitationCode` ≤32 ký tự.

Luồng: Zod parse → tìm wedding PUBLISHED → check `showRsvp` → nếu gửi `invitationCode`
thì mã **phải tồn tại** cho thiệp này (mã sai → **400**, không âm thầm bỏ qua) và
`numberOfPeople` không vượt `maximumPeople` của khách → hash IP (SHA-256 + secret,
không lưu IP thô) → rate-limit theo `ipHash` (10 lần / 10 phút / thiệp) →
**server tự sinh** `submissionKey = sha256(weddingId + fullName.lowercase + ipHash)[:32]`
→ upsert theo `(weddingId, submissionKey)` → trả success (không trả RSVP của người khác).

> **Giới hạn thiết kế (chấp nhận):** hai khách trùng họ tên gửi từ cùng một IP
> (chung wifi/NAT) sẽ ghi đè RSVP của nhau do cơ chế idempotent theo tên + IP.

### 7.2 Lời chúc — `POST /api/public/weddings/[slug]/wishes`
`guestName` 2–100 ký tự, `content` 1–2000 ký tự → check published & `showWishes` →
loại ký tự điều khiển, lưu text thuần → rate-limit theo `ipHash` (5 lời chúc / 10 phút /
thiệp) → tạo Wish `PENDING`. Public chỉ query `APPROVED`.

### 7.3 Public DTO (không truyền trực tiếp Prisma model ra public)
`PublicWeddingDto` gồm: slug, couple{groomName,brideName}, weddingDate, title,
introduction, loveStory, coverUrl, musicUrl, events[], gallery[], wishes[](đã duyệt),
visibility{...}. **Không** chứa phone/ipHash/submissionKey/ghi chú nội bộ.

---

## 8. Bảo mật
- **Middleware verify JWT `admin_session` tập trung** cho `/admin/*` (trừ login),
  `/preview/*`, `/api/admin/*`, `/api/uploads`, `/api/exports/*`; Cloudflare Zero Trust
  là lớp phụ (chỉ khi cấu hình `CF_ACCESS_*`). Guard trong từng page/route giữ nguyên
  làm defense-in-depth.
- Cookie session `httpOnly`, `sameSite=lax` (local `secure=false`; production `secure=true`).
- Mọi API admin tự kiểm tra session (không chỉ ẩn nút).
- Giới hạn đăng nhập sai theo IP; RSVP/lời chúc public rate-limit theo `ipHash`
  (bộ nhớ local, best-effort trên serverless → Upstash/Redis khi cần chặt chẽ).
- Lỗi login chung chung: "Thông tin đăng nhập không đúng".
- Upload: kiểm MIME + dung lượng, tên file UUID, không dùng tên gốc, chống extension kép.
- `/media/[id]` chỉ trả file của thiệp PUBLISHED (admin đăng nhập xem được cả draft).
- Xuất CSV escape công thức (`= @` và `+ -` không phải số) chống formula injection.
- Env vars nhạy cảm lưu ở Vercel Environment Variables (type=sensitive).

---

## 9. Upload file (local dev)
```
storage/uploads/weddings/{weddingId}/{cover|gallery|music|gift}/{uuid}.ext
```
Luồng: check admin → đọc multipart → check wedding & loại upload → check MIME/size →
ghi file UUID → tạo `WeddingMedia` → nếu insert lỗi thì xoá file → trả `mediaId` + URL nội bộ.

> **Sau MVP:** chuyển upload lên Supabase Storage hoặc Cloudflare R2.

---

## 10. Yêu cầu Frontend / Template (chốt từ prototype)
- Mobile-first, test 360px trước desktop; hoạt động tốt cả điện thoại lẫn PC.
- Một template MVP: **Classic Gold** (nhận đúng `PublicWeddingDto`).
- Mỗi section tự kiểm tra `visibility` và dữ liệu rỗng (empty state).
- **Không autoplay nhạc** khi chưa có tương tác người dùng.
- Gallery dùng thumbnail + lazy-load.
- **Animation/micro-interaction** (đã có ở prototype): ripple mọi nút, nút nam châm
  (chỉ pointer:fine), scroll-reveal, mở phong bì, countdown động, lightbox, confetti,
  toast; tôn trọng `prefers-reduced-motion`; nút chạm ≥44px, input 16px (chống zoom iOS).

---

## 11. Tiêu chí hoàn thành MVP
- [ ] Admin đăng nhập & quản lý nhiều thiệp.
- [ ] Tạo/sửa/preview/publish/archive thiệp.
- [ ] Public responsive, chạy tốt trên điện thoại & PC.
- [ ] Có sự kiện, album, nhạc, bản đồ, bật/tắt section.
- [ ] Khách gửi RSVP & lời chúc.
- [ ] Admin lọc RSVP, duyệt lời chúc, xuất CSV.
- [ ] Link khách mời cá nhân & giới hạn số người.
- [ ] Upload/xoá file không để orphan.
- [ ] Dữ liệu còn sau restart server (Supabase PostgreSQL).
- [ ] `lint`, `typecheck`, `test`, `build` đều pass.
