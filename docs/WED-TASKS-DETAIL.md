# WED — Wedding CRUD: Chi tiết Subtasks & Acceptance Criteria

> Giai đoạn 3 theo PLAN.md. Phụ thuộc: AUTH ✅, DB ✅.
> Tạo: 2026-07-22 · Tham chiếu: SPEC.md §4–§6, schema.prisma (model Wedding)
> Branch convention: `feature/WED-XX-mô-tả`

---

## WED-01 — `/admin/weddings` Danh sách thiệp

### Subtasks

| # | Subtask | Mô tả |
|---|---------|-------|
| 01a | **Server Component page** | `src/app/admin/weddings/page.tsx` — gọi `listWeddings()` (repository đã có), render bảng. Guard bằng `requireAdminSession()`. |
| 01b | **Bảng danh sách** | Cột: Cặp đôi (groom & bride), Slug (link), Trạng thái (badge màu), Ngày cưới, Ngày tạo, Actions. |
| 01c | **Status badge** | `DRAFT` → xám, `PUBLISHED` → xanh lá, `ARCHIVED` → vàng. Component tái dùng `<StatusBadge status={...} />`. |
| 01d | **Empty state** | Khi chưa có thiệp: icon + text "Chưa có thiệp nào" + nút "Tạo thiệp đầu tiên" → link `/admin/weddings/new`. |
| 01e | **Actions column** | Mỗi hàng: nút "Sửa" → `/admin/weddings/[id]/content`, nút "Xem" → `/preview/[id]` (new tab). |
| 01f | **Nav link** | Thêm link "Thiệp cưới" vào admin header (`layout.tsx`), active state. |

### Acceptance Criteria
- [ ] Truy cập `/admin/weddings` khi chưa login → redirect `/admin/login`
- [ ] Danh sách hiển thị đúng dữ liệu từ DB, sắp xếp theo `updatedAt` giảm dần
- [ ] Badge trạng thái đúng màu theo DRAFT/PUBLISHED/ARCHIVED
- [ ] Empty state hiển thị khi chưa có wedding nào
- [ ] Responsive: bảng scroll ngang trên mobile, không vỡ layout
- [ ] `typecheck` + `lint` pass

---

## WED-02 — `/admin/weddings/new` Tạo thiệp mới

### Subtasks

| # | Subtask | Mô tả |
|---|---------|-------|
| 02a | **Page + Form** | `src/app/admin/weddings/new/page.tsx` — form tạo thiệp với react-hook-form + zod. Guard bằng `requireAdminSession()`. |
| 02b | **Zod schema** | `createWeddingSchema` trong `src/features/weddings/wedding.schemas.ts`: `groomName` (2–60 ký tự), `brideName` (2–60 ký tự), `slug` (dùng `slugSchema` đã có), `weddingDate` (optional, ISO date string). |
| 02c | **Server Action** | `createWeddingAction` — validate input → check slug unique (query DB) → `createWedding()` → redirect `/admin/weddings/[id]/content`. |
| 02d | **Auto-generate slug** | Khi nhập tên groom + bride → tự tạo suggestion slug bằng `slugify()` (đã có). User có thể chỉnh tay. |
| 02e | **Slug uniqueness check** | Realtime debounce check slug (client gọi API hoặc Server Action) → hiển thị ✅/❌ bên cạnh input. |
| 02f | **Error handling** | Hiển thị lỗi validation inline từng field. Lỗi slug trùng: "Slug này đã được sử dụng". |

### Acceptance Criteria
- [ ] Tạo thiệp thành công → status = `DRAFT`, redirect đến trang sửa nội dung
- [ ] Slug tự sinh từ tên cặp đôi (vd: "Quân" + "Linh" → `quan-linh`)
- [ ] Slug trùng → thông báo lỗi rõ ràng, không cho submit
- [ ] Slug chứa dấu tiếng Việt / ký tự đặc biệt → lỗi validation
- [ ] Slug trùng từ cấm (admin, api, login, preview...) → lỗi validation
- [ ] Không nhập groomName hoặc brideName → lỗi validation
- [ ] `typecheck` + `lint` pass

---

## WED-03 — Validate slug nâng cao

### Subtasks

| # | Subtask | Mô tả |
|---|---------|-------|
| 03a | **API check unique** | `GET /api/admin/weddings/check-slug?slug=xxx` — trả `{ available: boolean }`. Dùng trong form tạo mới & sửa. Guard admin session. |
| 03b | **Mở rộng slug validation** | Bổ sung vào `slugSchema`: không cho 2 gạch ngang liên tiếp (`a--b`), không bắt đầu/kết thúc bằng số nếu cần. |
| 03c | **Unit test bổ sung** | Mở rộng `slug.test.ts`: test slug có dấu tiếng Việt (phải fail), slug trùng từ cấm, slug quá ngắn/dài, slug có ký tự đặc biệt, slug hợp lệ. |
| 03d | **Slug edit khi sửa** | Khi sửa wedding, cho phép đổi slug nhưng exclude chính wedding hiện tại ra khỏi unique check. |

### Acceptance Criteria
- [ ] API check-slug trả `available: true` khi slug chưa tồn tại
- [ ] API check-slug trả `available: false` khi slug đã tồn tại
- [ ] API check-slug require admin session, trả 401 nếu không có
- [ ] Tất cả unit test slug pass (bao gồm test mới)
- [ ] Sửa slug wedding: exclude self khi check unique
- [ ] `typecheck` + `lint` + `test` pass

---

## WED-04 — `/admin/weddings/[id]/content` Sửa nội dung

### Subtasks

| # | Subtask | Mô tả |
|---|---------|-------|
| 04a | **Layout admin wedding** | `src/app/admin/weddings/[id]/layout.tsx` — sidebar/tab nav cho các sub-page: Nội dung, Sự kiện, Gallery, Khách mời, RSVP, Lời chúc, Publish. Guard `requireAdminSession()`. Load wedding by ID, 404 nếu không tìm thấy. |
| 04b | **Content edit page** | `src/app/admin/weddings/[id]/content/page.tsx` — form sửa toàn bộ thông tin wedding. |
| 04c | **Zod schema update** | `updateWeddingSchema`: `groomName`, `brideName`, `slug`, `weddingDate`, `title` (max 200), `introduction` (max 2000), `loveStory` (max 5000), `primaryColor` (hex pattern). |
| 04d | **Section visibility toggles** | 7 toggle switches cho `showCountdown`, `showStory`, `showGallery`, `showRsvp`, `showWishes`, `showGift`, `showMusic`. Component `<ToggleSwitch>` tái dùng. |
| 04e | **Server Action update** | `updateWeddingAction(id, data)` — validate → check slug unique (exclude self) → `updateWedding()` → revalidate path → success toast. |
| 04f | **Gift data editor** | Textarea cho `giftData` (JSON text) — thông tin chuyển khoản/QR. Hiển thị preview parsed JSON bên cạnh. Validate JSON hợp lệ trước khi save. |
| 04g | **Primary color picker** | Input type="color" + text input hex. Preview: tô nền nhỏ bên cạnh. |
| 04h | **Auto-save indicator** | Hiển thị trạng thái "Đã lưu" / "Đang lưu..." / "Có thay đổi chưa lưu". Không auto-save (chỉ indicator). |

### Acceptance Criteria
- [ ] Load đúng dữ liệu wedding hiện tại vào form
- [ ] Sửa và lưu thành công → dữ liệu cập nhật trong DB
- [ ] Đổi slug → check unique (exclude self), cập nhật thành công
- [ ] Toggle visibility → cập nhật đúng các cờ `show*`
- [ ] giftData không phải JSON hợp lệ → lỗi validation
- [ ] Wedding không tồn tại → 404
- [ ] Truy cập khi chưa login → redirect login
- [ ] Responsive: form dùng được trên mobile
- [ ] `typecheck` + `lint` pass

---

## WED-05 — Archive (không xoá thật)

### Subtasks

| # | Subtask | Mô tả |
|---|---------|-------|
| 05a | **Archive action** | Server Action `archiveWeddingAction(id)` — set status → `ARCHIVED`. Chỉ PUBLISHED hoặc DRAFT mới archive được. |
| 05b | **Unarchive action** | Server Action `unarchiveWeddingAction(id)` — set status → `DRAFT` (về draft để review lại trước khi publish). |
| 05c | **Confirm dialog** | Modal xác nhận trước khi archive: "Thiệp sẽ không còn hiển thị công khai. Bạn có chắc?" |
| 05d | **UI trong danh sách** | Nút Archive (cho DRAFT/PUBLISHED) và Unarchive (cho ARCHIVED) trong action column. |
| 05e | **Filter danh sách** | Tabs hoặc dropdown lọc theo trạng thái: Tất cả / Draft / Published / Archived. |

### Acceptance Criteria
- [ ] Archive PUBLISHED wedding → status = ARCHIVED, `/w/[slug]` trả 404
- [ ] Archive DRAFT wedding → status = ARCHIVED
- [ ] Unarchive → status = DRAFT (không về PUBLISHED trực tiếp)
- [ ] Có confirm dialog trước khi archive
- [ ] Lọc danh sách theo trạng thái hoạt động đúng
- [ ] Không có nút "Xoá vĩnh viễn" ở UI (theo SPEC §5.1)
- [ ] `typecheck` + `lint` pass

---

## WED-06 — `/preview/[id]` Xem draft (chỉ admin)

### Subtasks

| # | Subtask | Mô tả |
|---|---------|-------|
| 06a | **Preview page** | `src/app/preview/[id]/page.tsx` — render template giống `/w/[slug]` nhưng: (1) cho phép mọi status (DRAFT/PUBLISHED/ARCHIVED), (2) yêu cầu admin session. |
| 06b | **Preview banner** | Banner cố định ở top: "🔍 Đang xem bản xem trước — [Draft/Published/Archived]" + nút "Quay lại chỉnh sửa" → `/admin/weddings/[id]/content`. |
| 06c | **Reuse template components** | Dùng chung `WeddingHero`, `Countdown`, `LoveStory`, `EventTimeline`, `WishList` — chỉ khác data loading (by ID thay vì by slug + PUBLISHED). |
| 06d | **Preview DTO mapper** | Hàm `toPreviewWeddingDto(wedding)` — giống `toPublicWeddingDto` nhưng nhận wedding ở mọi status (include events/media/wishes). |

### Acceptance Criteria
- [ ] Admin login → truy cập `/preview/[id]` → thấy thiệp draft
- [ ] Chưa login → redirect `/admin/login`
- [ ] Wedding không tồn tại → 404
- [ ] Banner preview hiển thị đúng status hiện tại
- [ ] Nội dung render giống hệt trang public `/w/[slug]`
- [ ] Nút "Quay lại chỉnh sửa" hoạt động đúng
- [ ] `typecheck` + `lint` pass

---

## WED-07 — Publish validator

### Subtasks

| # | Subtask | Mô tả |
|---|---------|-------|
| 07a | **Validator function** | `validatePublishReady(wedding)` trong `src/features/weddings/wedding.validators.ts` → trả `{ valid: boolean; errors: string[] }`. |
| 07b | **Publish rules** | Bắt buộc: (1) `weddingDate` phải có, (2) ≥1 event (`events.length > 0`), (3) `coverPath` phải có (cover image uploaded). Tham chiếu SPEC §4. |
| 07c | **Publish action** | Server Action `publishWeddingAction(id)` — chạy validator → nếu valid: set status `PUBLISHED` → revalidate `/w/[slug]`. Nếu invalid: trả danh sách lỗi. |
| 07d | **Unpublish action** | Server Action `unpublishWeddingAction(id)` — set status → `DRAFT`. Confirm dialog. |
| 07e | **Publish page UI** | `src/app/admin/weddings/[id]/publish/page.tsx` — checklist hiển thị các điều kiện (✅/❌), nút Publish (disabled nếu chưa đủ), nút Unpublish (nếu đang published). |
| 07f | **Unit test validator** | Test cases: thiếu weddingDate, thiếu events, thiếu cover, đủ điều kiện, wedding đã archived (không cho publish). |
| 07g | **Post-publish info** | Sau khi publish thành công: hiển thị link công khai `/w/[slug]` (clickable, copy button), QR code placeholder (UTIL-03 sẽ làm sau). |

### Acceptance Criteria
- [ ] Publish thiếu weddingDate → lỗi "Chưa có ngày cưới"
- [ ] Publish thiếu events → lỗi "Cần ít nhất 1 sự kiện"
- [ ] Publish thiếu cover → lỗi "Cần ảnh bìa"
- [ ] Publish đủ điều kiện → status = PUBLISHED, `/w/[slug]` trả 200
- [ ] Publish wedding ARCHIVED → lỗi (phải unarchive trước)
- [ ] Unpublish → status = DRAFT, `/w/[slug]` trả 404
- [ ] Checklist UI hiển thị đúng ✅/❌ theo điều kiện
- [ ] Unit test validator pass tất cả cases
- [ ] Link công khai hiển thị sau publish
- [ ] `typecheck` + `lint` + `test` pass

---

## Tổng hợp files cần tạo/sửa

### Files mới
```
src/app/admin/weddings/page.tsx                    # WED-01: danh sách
src/app/admin/weddings/new/page.tsx                # WED-02: tạo mới
src/app/admin/weddings/[id]/layout.tsx             # WED-04: layout sửa
src/app/admin/weddings/[id]/content/page.tsx       # WED-04: sửa nội dung
src/app/admin/weddings/[id]/publish/page.tsx       # WED-07: publish page
src/app/api/admin/weddings/check-slug/route.ts     # WED-03: API check slug
src/app/preview/[id]/page.tsx                      # WED-06: preview
src/features/weddings/wedding.schemas.ts           # WED-02,04: Zod schemas
src/features/weddings/wedding.validators.ts        # WED-07: publish validator
src/features/weddings/wedding.validators.test.ts   # WED-07: unit tests
src/features/weddings/wedding.actions.ts           # WED-02,04,05,07: Server Actions
src/components/admin/StatusBadge.tsx                # WED-01: badge component
src/components/admin/ToggleSwitch.tsx               # WED-04: toggle component
src/components/admin/ConfirmDialog.tsx              # WED-05: confirm modal
```

### Files sửa
```
src/app/admin/layout.tsx                           # WED-01f: thêm nav link
src/features/weddings/wedding.repository.ts        # WED-03,05: thêm queries
src/lib/utils/slug.test.ts                         # WED-03c: thêm test cases
```

---

## Thứ tự thực hiện khuyến nghị

```
WED-02 (tạo mới + schema) ──┐
WED-03 (slug validation)  ──┤
                              ├→ WED-01 (danh sách) → WED-05 (archive + filter)
WED-04 (sửa nội dung)     ──┘
                              └→ WED-06 (preview) → WED-07 (publish)
```

1. **WED-02 + WED-03** trước (schemas, actions, slug check)
2. **WED-04** sửa nội dung (form lớn nhất)
3. **WED-01** danh sách (cần data để hiển thị)
4. **WED-05** archive (action đơn giản, cần list UI)
5. **WED-06** preview (reuse template components)
6. **WED-07** publish (validator + UI cuối cùng)

---

## Ước lượng

| Task | Subtasks | Độ phức tạp | Ghi chú |
|------|----------|-------------|---------|
| WED-01 | 6 | Trung bình | Cần StatusBadge, empty state, nav |
| WED-02 | 6 | Trung bình | Form + Server Action + slug auto-gen |
| WED-03 | 4 | Nhỏ | API + tests, slug logic đã có sẵn |
| WED-04 | 8 | **Lớn** | Form phức tạp nhất: nhiều field, toggles, color picker, JSON editor |
| WED-05 | 5 | Nhỏ | Action đơn giản + confirm dialog |
| WED-06 | 4 | Trung bình | Reuse components, thêm banner + auth check |
| WED-07 | 7 | Trung bình | Validator + publish UI + unit tests |
| **Tổng** | **40 subtasks** | | |
