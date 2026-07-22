# SECURITY-REVIEW — Rà soát bảo mật (UTIL-05)

> Rà soát toàn bộ luồng trước khi hoàn thiện MVP. Cập nhật: 2026-07-22.
> Trạng thái: ✅ đạt · ⚠️ cần theo dõi · ❌ lỗ hổng cần sửa

## 1. Xác thực & Phiên (Auth / Session)
| Mục | TT | Ghi chú |
|-----|----|---------|
| Mật khẩu admin hash bằng bcrypt (không lưu plaintext) | ✅ | `ADMIN_PASSWORD_HASH` |
| Session JWT ký bằng `SESSION_SECRET` (≥32 ký tự, validate ở `env.ts`) | ✅ | `jose` |
| Cookie `httpOnly`, `sameSite=lax` | ✅ | chống XSS đọc cookie & CSRF cơ bản |
| Lỗi đăng nhập chung chung (không lộ email/mật khẩu) | ✅ | AUTH-07 |
| Rate-limit đăng nhập theo IP | ✅ | AUTH-06 (bộ nhớ local — ⚠️ reset khi serverless cold start) |
| Cloudflare Zero Trust bảo vệ `/admin/*` và `/preview/*` | ✅ | WED-08 |

## 2. Phân quyền (Authorization)
| Mục | TT | Ghi chú |
|-----|----|---------|
| Mọi server action admin gọi `requireAdminSession()` | ✅ | event/guest/rsvp/wedding actions |
| API export CSV kiểm tra session admin | ✅ | UTIL-01 trả 401 nếu chưa login |
| Các bản ghi con (event/guest) kiểm tra thuộc đúng `weddingId` | ✅ | chống IDOR |
| Route công khai chỉ trả thiệp `PUBLISHED` | ✅ | `/w`, `/api/calendar`, `/api/qr`, RSVP |

## 3. Dữ liệu công khai (Data exposure)
| Mục | TT | Ghi chú |
|-----|----|---------|
| `PublicWeddingDto` ẩn `phone/ipHash/submissionKey/ghi chú nội bộ` | ✅ | TPL-01 + test |
| Wish chỉ hiển thị bản `APPROVED` | ✅ | RSVP-06 |
| IP người gửi RSVP được hash SHA-256 + secret (không lưu IP thô) | ✅ | RSVP-03 |
| OG image / QR chỉ dùng dữ liệu công khai (tên, ngày) | ✅ | UTIL-03/04 |

## 4. Đầu vào & Chống lạm dụng (Input / Abuse)
| Mục | TT | Ghi chú |
|-----|----|---------|
| Toàn bộ input validate bằng Zod (RSVP, wish, guest, event, slug, upload) | ✅ | |
| Wish lọc ký tự điều khiển | ✅ | RSVP-05 |
| RSVP idempotent theo `submissionKey` (chống spam trùng) | ✅ | RSVP-02 |
| GUEST-04 giới hạn `numberOfPeople` theo `maximumPeople` | ✅ | server-side enforce |
| Upload kiểm tra MIME, size, chống double-extension | ✅ | MED-02 + test |
| Slug chặn từ cấm (admin/api/login/preview) | ✅ | WED-03 |

## 5. Khuyến nghị theo dõi (⚠️)
1. **Rate-limit login** đang lưu bộ nhớ local → trên Vercel serverless dễ bị reset. Cân nhắc chuyển sang Upstash/Redis nếu bị brute-force.
2. **RSVP công khai chưa có rate-limit** — hiện chống trùng bằng `submissionKey`, nhưng nên thêm giới hạn theo `ipHash` để chống flood.
3. **CSRF cho POST công khai**: các endpoint RSVP/wish là public theo thiết kế; đảm bảo không có side-effect nhạy cảm ngoài tạo bản ghi PENDING.
4. Đảm bảo `.env*` không commit (đã có trong `.gitignore`).

## Kết luận
Không phát hiện lỗ hổng chặn phát hành. Các mục ⚠️ là cải thiện phòng thủ chiều sâu, không bắt buộc cho MVP.
