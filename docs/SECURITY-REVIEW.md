# SECURITY-REVIEW — Rà soát bảo mật (UTIL-05)

> Rà soát toàn bộ luồng trước khi hoàn thiện MVP. Cập nhật: 2026-07-24
> (sau đợt audit + hardening FIX-01…FIX-07 — xem `TASKS-status.md` mục FIX).
> Trạng thái: ✅ đạt · ⚠️ cần theo dõi · ❌ lỗ hổng cần sửa

## 1. Xác thực & Phiên (Auth / Session)
| Mục | TT | Ghi chú |
|-----|----|---------|
| Mật khẩu admin hash bằng bcrypt (không lưu plaintext) | ✅ | `ADMIN_PASSWORD_HASH` |
| Session JWT ký bằng `SESSION_SECRET` (≥32 ký tự, validate ở `env.ts`) | ✅ | `jose` |
| Cookie `httpOnly`, `sameSite=lax`, `secure` ở production (cả khi set lẫn khi clear) | ✅ | FIX-07 |
| Lỗi đăng nhập chung chung (không lộ email/mật khẩu) | ✅ | AUTH-07 |
| Rate-limit đăng nhập theo IP | ✅ | AUTH-06 (bộ nhớ local — ⚠️ reset khi serverless cold start) |
| **Middleware verify JWT `admin_session`** cho `/admin/*`, `/preview/*`, `/api/admin/*`, `/api/uploads`, `/api/exports/*` | ✅ | FIX-02 — chặn tập trung, không phụ thuộc guard từng trang |
| Cloudflare Zero Trust bảo vệ `/admin/*` và `/preview/*` | ⚠️ | WED-08 — **chỉ khi cấu hình `CF_ACCESS_*`**; không cấu hình thì bypass (đã có lớp JWT ở trên nên không còn là single point of failure) |

## 2. Phân quyền (Authorization)
| Mục | TT | Ghi chú |
|-----|----|---------|
| Mọi server action admin gọi `requireAdminSession()` | ✅ | event/guest/rsvp/wedding actions (defense-in-depth sau middleware) |
| API export CSV kiểm tra session admin | ✅ | UTIL-01 trả 401 nếu chưa login |
| Các bản ghi con (event/guest) kiểm tra thuộc đúng `weddingId` | ✅ | chống IDOR |
| Route công khai chỉ trả thiệp `PUBLISHED` | ✅ | `/w`, `/api/calendar`, `/api/qr`, RSVP |
| `/media/[id]` chỉ trả file của thiệp `PUBLISHED` (admin xem được draft để preview) | ✅ | FIX-03 — trước đây media của thiệp DRAFT/ARCHIVED bị lộ public |

## 3. Dữ liệu công khai (Data exposure)
| Mục | TT | Ghi chú |
|-----|----|---------|
| `PublicWeddingDto` ẩn `phone/ipHash/submissionKey/ghi chú nội bộ` | ✅ | TPL-01 + test |
| Wish chỉ hiển thị bản `APPROVED` | ✅ | RSVP-06 |
| IP người gửi RSVP được hash SHA-256 + secret (không lưu IP thô) | ✅ | RSVP-03 |
| OG image / QR chỉ dùng dữ liệu công khai (tên, ngày) | ✅ | UTIL-03/04 |
| `invitationCode` sinh bằng CSPRNG (Web Crypto, rejection sampling) | ✅ | FIX-07 — trước dùng `Math.random()` dự đoán được |

## 4. Đầu vào & Chống lạm dụng (Input / Abuse)
| Mục | TT | Ghi chú |
|-----|----|---------|
| Toàn bộ input validate bằng Zod (RSVP, wish, guest, event, slug, upload) | ✅ | |
| Wish lọc ký tự điều khiển | ✅ | RSVP-05 |
| RSVP idempotent theo `submissionKey` (chống spam trùng) | ✅ | RSVP-02 |
| RSVP với `invitationCode` sai → 400 (không âm thầm bỏ qua giới hạn) | ✅ | FIX-04 |
| GUEST-04 giới hạn `numberOfPeople` theo `maximumPeople` | ✅ | server-side enforce |
| Rate-limit public: RSVP 10 lần & wish 5 lần / 10 phút / `ipHash` / thiệp | ✅ | FIX-06 (bộ nhớ local — ⚠️ best-effort trên serverless) |
| Xuất CSV escape formula injection (`= @`, và `+ -` không phải số/điện thoại) | ✅ | FIX-05 |
| `/api/qr` không phản chiếu `?guest=` tuỳ ý (chỉ nhúng mã tồn tại thật) | ✅ | FIX-07 |
| Upload kiểm tra MIME, size, chống double-extension | ✅ | MED-02 + test |
| Slug chặn từ cấm (`admin/api/login/logout/preview/w/media/static/_next`) | ✅ | WED-03 |

## 5. Khuyến nghị theo dõi (⚠️)
1. **Rate-limit (login + public) lưu bộ nhớ local** → trên Vercel serverless mỗi instance
   một bộ đếm, reset khi cold start. Đủ chống spam thủ công; muốn chặt chẽ trước kẻ tấn
   công chủ đích cần store dùng chung (Upstash Redis / Vercel KV).
2. **IP lấy từ `x-forwarded-for`** — trên Vercel header này do platform đặt nên tin được;
   nếu đổi hạ tầng cần xem lại nguồn IP tin cậy.
3. **CSRF cho POST công khai**: các endpoint RSVP/wish là public theo thiết kế; đảm bảo
   không có side-effect nhạy cảm ngoài tạo bản ghi PENDING.
4. Đảm bảo `.env*` không commit (đã có trong `.gitignore`).
5. Hai khách trùng tên + cùng IP sẽ ghi đè RSVP của nhau (hệ quả thiết kế idempotent —
   đã ghi rõ trong SPEC §7.1).

## Kết luận
Sau đợt hardening 2026-07-24: các phát hiện nghiêm trọng của audit (middleware bypass,
lộ media thiệp nháp, publish bị chặn do kiểm sai nguồn cover) đã được xử lý. Các mục ⚠️
còn lại là cải thiện phòng thủ chiều sâu, không chặn phát hành.
