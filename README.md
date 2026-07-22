# Thiệp Ước — Dịch vụ Thiệp Cưới Online

Tạo thiệp cưới online sang trọng, gửi link riêng cho khách mời, nhận xác nhận
tham dự (RSVP) và lời chúc.

## Live
🌐 **https://thiepcuoi-five.vercel.app**
📖 Thiệp mẫu: [/w/quan-linh](https://thiepcuoi-five.vercel.app/w/quan-linh)

## Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **UI:** Tailwind CSS v3, lucide-react
- **Database:** Supabase PostgreSQL + Prisma ORM
- **Auth:** bcryptjs + jose (JWT session cookie)
- **Deploy:** Vercel (auto-deploy từ `main`)

## Cấu trúc
```
src/
├─ app/
│  ├─ layout.tsx, page.tsx       # Landing page
│  └─ w/[slug]/page.tsx          # Trang thiệp công khai
├─ components/
│  ├─ landing/                   # Nav, sections landing
│  ├─ wedding/                   # Hero, Countdown, sections thiệp
│  └─ ui/                        # Interactions (scroll-reveal, ripple...)
├─ features/
│  └─ weddings/                  # Repository, public DTO, mapper
└─ lib/
   ├─ auth/password.ts           # Hash/verify mật khẩu
   ├─ db.ts                      # Prisma client singleton
   ├─ domain.ts                  # Zod schemas (WeddingStatus, etc.)
   ├─ env.ts                     # Environment validation
   └─ utils/slug.ts              # Slug validation

prisma/
├─ schema.prisma                 # PostgreSQL schema
└─ seed.ts                       # Seed data demo "Quân & Linh"

# Prototype tĩnh (giữ nguyên, xem PROTOTYPE.md)
index.html, css/, js/
```

## Chạy local
```bash
# 1. Clone & cài
git clone https://github.com/jdhei/Project-Thiep-Cuoi.git
cd Project-Thiep-Cuoi && npm install

# 2. Tạo .env.local từ .env.example
cp .env.example .env.local
# Điền DATABASE_URL, DIRECT_URL, SESSION_SECRET, ...

# 3. Push schema & seed
npx prisma db push
npm run db:seed

# 4. Chạy dev
npm run dev
```

## Scripts
| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Vitest unit tests |
| `npm run db:push` | Push schema lên DB |
| `npm run db:seed` | Seed dữ liệu demo |
| `npm run db:studio` | Prisma Studio (xem DB) |

## Tài liệu
- `docs/SPEC.md` — Đặc tả sản phẩm
- `docs/PLAN.md` — Kế hoạch triển khai theo giai đoạn
- `docs/TASKS-status.md` — Tiến độ công việc chi tiết
- `docs/DECISIONS.md` — Quyết định kiến trúc (ADR)

## Tiến độ (53%)
- ✅ Prototype UI/UX, Setup, Database, Deploy (Vercel + Supabase)
- ✅ Admin Auth (login/logout/session/rate-limit/E2E)
- 🟡 Template Public (5/7 task)
- ⬜ Wedding CRUD → Media → RSVP → Guest → Hoàn thiện
