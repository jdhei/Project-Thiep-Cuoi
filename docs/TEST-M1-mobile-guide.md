# TEST-M1 — Hướng dẫn kiểm thử trên điện thoại thật

> Kiểm thử thủ công thiệp cưới trên thiết bị thật (Android Chrome / iPhone Safari).
> Mục tiêu: xác nhận trải nghiệm mượt, không vỡ layout, form dùng được khi bàn phím mở, mạng chậm vẫn ổn.
> Liên quan: PROTO-05 (responsive), PROTO-06 (a11y), RSVP-04, GUEST-03, UTIL-03.

---

## 1. Chuẩn bị

### Thiết bị tối thiểu
| Nhóm | Thiết bị gợi ý | Trình duyệt |
|------|----------------|-------------|
| iOS | iPhone SE (màn nhỏ 375px) + iPhone 14/15 (notch/Dynamic Island) | Safari |
| Android | 1 máy tầm trung (Samsung/Xiaomi, ~360–412px) | Chrome |
| Tùy chọn | iPad / máy màn lớn | Safari/Chrome |

### Môi trường
- **URL production:** `https://thiepcuoi-five.vercel.app`
- **Thiệp mẫu công khai:** `/w/quan-linh`
- **Link khách mời (GUEST-03):** `/w/quan-linh?guest=<MÃ>` — lấy mã trong Admin → tab **Khách mời** → *Copy link mời*
- **Admin:** `/admin` (cần vượt Cloudflare Access + tài khoản admin)

### Công cụ ghi chép
- Chuẩn bị bảng kết quả (mục 6) trên Google Sheets/Excel.
- Bật quay màn hình khi gặp lỗi (iOS: Control Center → Screen Recording; Android: Quick Settings → Screen record).
- Chụp màn hình mọi lỗi kèm: model máy, phiên bản OS, trình duyệt, bước tái hiện.

### Cách giả lập mạng chậm
- **Android Chrome:** cắm máy vào PC → `chrome://inspect` → DevTools → tab Network → Throttling → **Slow 3G**.
- **iPhone:** Cài đặt → Developer → **Network Link Conditioner** → 3G. (Hoặc bật/tắt Wi‑Fi để test khi mất mạng giữa chừng.)

---

## 2. Checklist tổng quát (mọi màn hình)

Kiểm tra trên **cả** iOS Safari và Android Chrome:

- [ ] Không có thanh cuộn ngang (không bị "tràn" phải/trái) ở 360px và 375px.
- [ ] Nội dung không bị che bởi **notch/Dynamic Island** (dùng `viewport-fit=cover` + safe-area).
- [ ] Chữ đọc được, không quá nhỏ; tiêu đề không bị cắt.
- [ ] Ảnh tải đủ, không méo tỉ lệ, không để khoảng trắng vỡ khung.
- [ ] Mọi nút/liên kết bấm được, vùng chạm ≥ **44×44px**.
- [ ] Cuộn trang mượt, không giật; hiệu ứng scroll-reveal chạy đúng.
- [ ] Xoay ngang (landscape) không vỡ layout nghiêm trọng.
- [ ] Bật **Reduced Motion** (iOS: Cài đặt → Trợ năng → Chuyển động; Android: Trợ năng) → animation giảm/tắt, không gây khó chịu.

---

## 3. Kịch bản test theo luồng khách mời (Guest)

### KB-01 — Mở phong bì (envelope)
1. Mở `/w/quan-linh`.
2. Màn hình phong bì hiển thị đầy đủ, canh giữa.
3. Chạm để mở phong bì.
4. **Kỳ vọng:** hiệu ứng mở mượt, chuyển vào nội dung thiệp; không nhảy layout. Thử mở lại bằng phím (nếu có bàn phím ngoài) — a11y.

### KB-02 — Hero + Countdown
1. Sau khi mở, xem phần Hero (tên cô dâu/chú rể).
2. **Kỳ vọng:** tên hiển thị đầy đủ, không tràn; ảnh nền/hoa rơi không che chữ.
3. Kéo tới **Countdown**: số ngày/giờ/phút/giây đếm lùi đúng, không nhấp nháy vỡ khung.

### KB-03 — Câu chuyện & Sự kiện
1. Cuộn tới **Chuyện của chúng mình** (nếu bật).
2. Cuộn tới **Sự kiện**: kiểm tra thời gian, địa chỉ.
3. Bấm **link bản đồ** (nếu có) → mở Google Maps đúng địa điểm.
4. Bấm **📅 Thêm vào lịch** → tải/mở file `.ics` (UTIL-02).
   - iOS: mở bằng Lịch, thêm sự kiện được.
   - Android: mở bằng Google Calendar.

### KB-04 — Album ảnh (Gallery + Lightbox)
1. Cuộn tới **Album ảnh**.
2. Ảnh lazy-load khi cuộn tới (không tải hết cùng lúc).
3. Chạm một ảnh → mở **lightbox** toàn màn hình.
4. Vuốt/nhấn để xem ảnh kế; chạm ngoài hoặc nút X để đóng.
5. **Kỳ vọng:** lightbox không cho cuộn nền, đóng lại đúng vị trí cũ.

### KB-05 — RSVP (quan trọng — bàn phím mở form)
1. Cuộn tới **RSVP**.
2. Chạm ô **Họ tên** → bàn phím bật lên.
3. **Kỳ vọng then chốt:**
   - [ ] Ô input **không bị bàn phím che** (trang tự cuộn để thấy ô đang gõ).
   - [ ] Font input ≥ **16px** → iOS **không auto-zoom** khi focus.
   - [ ] Chuyển giữa các ô (Next/Done) mượt.
4. Chọn trạng thái **Sẽ tham dự** → nhập **Số người**.
   - Với link thường: tối đa 20.
   - Với link `?guest=` có giới hạn: nhập vượt `maximumPeople` → server báo lỗi rõ ràng (GUEST-04).
5. Chọn **Không tham dự** → ô số người ẩn/về 0.
6. Bấm **Gửi xác nhận**.
   - [ ] Trạng thái loading hiển thị, nút không bấm được 2 lần.
   - [ ] Thành công → hiện "Cảm ơn bạn đã xác nhận!".
7. **Idempotent:** gửi lại cùng tên trên cùng máy → không tạo bản ghi trùng (RSVP-02).

### KB-06 — Link khách mời cá nhân (GUEST-03)
1. Mở `/w/quan-linh?guest=<MÃ>`.
2. **Kỳ vọng:**
   - [ ] Ô Họ tên **tự điền sẵn** tên khách.
   - [ ] Lời nhắn riêng (nếu có) hiển thị phía trên form.
   - [ ] Giới hạn số người theo đúng thư mời của khách đó.

### KB-07 — Lời chúc (Wishes)
1. Cuộn tới **Sổ lời chúc**.
2. Nhập tên + lời chúc → gửi.
3. **Kỳ vọng:** hiện thông báo đã gửi; lời chúc **chưa xuất hiện ngay** (chờ admin duyệt — chỉ APPROVED mới hiện, RSVP-06).

### KB-08 — Nhạc nền (Music Player)
1. **Kỳ vọng:** nhạc **KHÔNG tự phát** khi mở trang (đúng chính sách iOS/Android).
2. Chạm nút play → nhạc phát; chạm lại → dừng.
3. Khóa màn/chuyển app rồi quay lại → trạng thái hợp lý, không lỗi.

### KB-09 — Quét QR (UTIL-03)
1. Từ máy khác/màn hình, mở ảnh QR (`/api/qr/quan-linh` hoặc QR trong Admin → Xuất bản).
2. Dùng camera điện thoại quét.
3. **Kỳ vọng:** mở đúng `/w/quan-linh`; QR có `?guest=` thì tự điền tên.

### KB-10 — Chia sẻ link (OG image, UTIL-04)
1. Dán link `/w/quan-linh` vào **Zalo / Messenger / iMessage**.
2. **Kỳ vọng:** hiện thẻ xem trước với ảnh OG (tên cặp đôi + ngày cưới), tiêu đề, mô tả.

---

## 4. Kịch bản test luồng Admin (tùy chọn, nếu vượt được Cloudflare Access)

> Cần tài khoản admin + bypass Cloudflare Zero Trust.

- **AD-01 Đăng nhập:** `/admin/login` trên mobile — form gõ được, bàn phím không che, đăng nhập thành công.
- **AD-02 Danh sách/Tạo thiệp:** bảng/thẻ hiển thị gọn trên màn nhỏ, không tràn ngang.
- **AD-03 Khách mời:** thêm khách, **Copy link mời** hoạt động (clipboard trên mobile).
- **AD-04 RSVP:** xem danh sách RSVP + tổng số người; bấm **Xuất CSV** tải file được.
- **AD-05 Xuất bản:** checklist hiển thị đúng; khối QR + nút tải hiển thị gọn trên mobile.

---

## 5. Kịch bản mạng chậm & lỗi mạng

- **NET-01 Slow 3G:** mở `/w/quan-linh` — trang vẫn dùng được, ảnh tải dần, không "trắng trang" vô hạn.
- **NET-02 Gửi RSVP khi mạng chậm:** nút hiện loading, không bấm trùng; chờ phản hồi rồi báo kết quả.
- **NET-03 Mất mạng giữa chừng:** tắt Wi‑Fi rồi bấm Gửi RSVP → hiện thông báo lỗi rõ ràng (không treo, không mất dữ liệu đã nhập).
- **NET-04 Có mạng lại:** gửi lại thành công.

---

## 6. Mẫu ghi chép kết quả

### 6.1 Thông tin phiên test
| Trường | Giá trị |
|--------|---------|
| Ngày test | |
| Người test | |
| Thiết bị | (VD: iPhone SE 2022) |
| OS / phiên bản | (VD: iOS 17.5) |
| Trình duyệt | (VD: Safari) |
| URL / commit | |
| Loại mạng | Wi‑Fi / 4G / Slow 3G |

### 6.2 Bảng kết quả theo kịch bản
| Mã | Kịch bản | Kết quả | Mức độ | Ghi chú / ảnh |
|----|----------|---------|--------|----------------|
| KB-01 | Mở phong bì | ☐ Pass ☐ Fail | | |
| KB-02 | Hero + Countdown | ☐ Pass ☐ Fail | | |
| KB-03 | Câu chuyện & Sự kiện + .ics | ☐ Pass ☐ Fail | | |
| KB-04 | Gallery + Lightbox | ☐ Pass ☐ Fail | | |
| KB-05 | RSVP (bàn phím) | ☐ Pass ☐ Fail | | |
| KB-06 | Link ?guest= | ☐ Pass ☐ Fail | | |
| KB-07 | Lời chúc | ☐ Pass ☐ Fail | | |
| KB-08 | Nhạc nền | ☐ Pass ☐ Fail | | |
| KB-09 | Quét QR | ☐ Pass ☐ Fail | | |
| KB-10 | OG chia sẻ | ☐ Pass ☐ Fail | | |
| NET-01..04 | Mạng chậm/lỗi | ☐ Pass ☐ Fail | | |

### 6.3 Phân loại mức độ lỗi (Severity)
| Mức | Ý nghĩa | Xử lý |
|-----|---------|-------|
| **P0 – Blocker** | Không dùng được tính năng chính (VD: không gửi được RSVP, vỡ layout toàn trang) | Sửa ngay, chặn phát hành |
| **P1 – Major** | Lỗi rõ nhưng có cách né (VD: bàn phím che ô nhập) | Sửa trước khi phát hành |
| **P2 – Minor** | Lỗi nhỏ về giao diện, không cản trở | Đưa vào backlog |
| **P3 – Cosmetic** | Chi tiết thẩm mỹ | Tùy chọn |

### 6.4 Mẫu mô tả 1 bug
```
[Mã KB] – [Tiêu đề ngắn]
Thiết bị: iPhone SE 2022 / iOS 17.5 / Safari
Mạng: Slow 3G
Các bước tái hiện:
  1. ...
  2. ...
Kết quả thực tế: ...
Kết quả kỳ vọng: ...
Mức độ: P1
Bằng chứng: (link ảnh/video)
```

---

## 7. Điều kiện PASS cho TEST-M1

TEST-M1 được coi là **ĐẠT** khi:
- [ ] Không còn lỗi **P0** và **P1** trên cả iOS Safari và Android Chrome.
- [ ] KB-05 (RSVP với bàn phím) Pass trên cả hai nền tảng.
- [ ] Không có cuộn ngang / tràn layout ở 360px và 375px.
- [ ] Luồng khách hoàn chỉnh: mở thiệp → RSVP → lời chúc chạy trơn tru khi mạng chậm.
- [ ] Đã lưu bảng kết quả (6.2) + ảnh/video cho mọi lỗi tìm thấy.

Sau khi đạt: cập nhật `docs/TASKS-status.md` đánh dấu **TEST-M1 ✅** và ghi ngày + thiết bị đã test.
