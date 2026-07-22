import Link from "next/link";

/* ---------------- Hero ---------------- */
export function LandingHero() {
  return (
    <header
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pb-16 pt-28 text-center"
      style={{ background: "radial-gradient(120% 90% at 50% -10%,#fff,#FBF7F0 55%,#F4ECDD)" }}
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-[8%] -z-0 aspect-square w-[min(80vw,720px)] -translate-x-1/2 rounded-full blur-md"
        style={{ background: "radial-gradient(circle,rgba(230,211,172,.5),transparent 65%)" }}
      />
      <div className="relative z-10 max-w-3xl">
        <span className="reveal in mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold-deep">
          Dịch vụ thiệp cưới online
        </span>
        <h1 className="reveal in text-[clamp(2.3rem,7vw,5rem)] leading-[1.06]" data-delay="1">
          Kể câu chuyện tình yêu của bạn <em className="text-gold-deep">trong một</em>{" "}
          <span className="font-script text-rose">thiệp</span> <em className="text-gold-deep">đáng nhớ</em>
        </h1>
        <p className="reveal in mx-auto mb-9 mt-6 max-w-xl text-[clamp(1rem,2.6vw,1.08rem)] text-muted" data-delay="2">
          Tạo thiệp cưới sang trọng, gửi link riêng cho khách mời, nhận xác nhận tham dự và những lời chúc
          ngọt ngào — tất cả chỉ trong vài phút.
        </p>
        <div className="reveal in flex flex-wrap justify-center gap-4" data-delay="3">
          <Link href="/w/quan-linh" className="btn">
            💌 Mở thiệp mẫu
          </Link>
          <a href="#pricing" className="btn btn-ghost">
            Xem bảng giá
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Features ---------------- */
const FEATURES = [
  { ic: "🔗", h: "Link riêng cho từng thiệp", p: "Mỗi thiệp có đường dẫn đẹp dạng /w/quan-linh. Khách mở ngay, không cần đăng nhập." },
  { ic: "✅", h: "Xác nhận tham dự (RSVP)", p: "Khách chọn tham dự, số người đi cùng và để lại lời nhắn. Bạn nắm số lượng trong tích tắc." },
  { ic: "💬", h: "Sổ lời chúc", p: "Nhận lời chúc từ khách mời, kiểm duyệt trước khi hiển thị công khai trên thiệp." },
  { ic: "🖼️", h: "Album & nhạc nền", p: "Tải ảnh cưới, chọn nhạc nền lãng mạn. Ảnh tải nhanh, tối ưu cho di động." },
  { ic: "⏳", h: "Đếm ngược & lịch trình", p: "Countdown tới ngày cưới, bản đồ Google Maps và nút thêm sự kiện vào lịch (.ics)." },
  { ic: "📊", h: "Quản lý & xuất CSV", p: "Lọc RSVP theo trạng thái, duyệt lời chúc và xuất danh sách khách ra file CSV." },
];

export function Features() {
  return (
    <section id="features">
      <div className="wrap">
        <div className="reveal mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-1 block font-script text-[1.7rem] text-rose">Vì sao chọn Thiệp Ước</span>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.9rem)]">Mọi thứ cho ngày trọng đại</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.h}
              className="reveal group rounded-3xl border border-gold-soft/40 bg-paper p-8 shadow-soft-sm transition-transform duration-500 hover:-translate-y-2 hover:shadow-soft"
              data-delay={(i % 3) + 1}
            >
              <div className="mb-4 grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br from-gold-soft to-white p-3 text-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                {f.ic}
              </div>
              <h3 className="mb-2 text-xl">{f.h}</h3>
              <p className="text-[0.95rem] text-muted">{f.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Steps ---------------- */
const STEPS = [
  { h: "Tạo thiệp", p: "Nhập tên cô dâu, chú rể, ngày cưới và chọn đường dẫn riêng." },
  { h: "Thêm nội dung", p: "Chuyện tình, lịch trình, album ảnh, nhạc nền và bật/tắt từng mục." },
  { h: "Xem thử & xuất bản", p: "Preview trên điện thoại, chỉnh chu rồi bấm Publish để kích hoạt link." },
  { h: "Gửi & theo dõi", p: "Gửi link cho khách, nhận RSVP và lời chúc theo thời gian thực." },
];

export function Steps() {
  return (
    <section id="how" style={{ background: "linear-gradient(180deg,transparent,#F4ECDD 40%,transparent)" }}>
      <div className="wrap">
        <div className="reveal mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-1 block font-script text-[1.7rem] text-rose">Đơn giản đến bất ngờ</span>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.9rem)]">Bốn bước có ngay thiệp</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-5">
          {STEPS.map((s, i) => (
            <div
              key={s.h}
              className="reveal relative rounded-2xl border border-gold-soft/40 bg-paper px-6 pb-6 pt-9 transition-transform duration-500 hover:-translate-y-1.5 hover:shadow-soft-sm"
              data-delay={i + 1}
            >
              <span className="absolute left-6 top-[-0.6rem] font-serif text-[2.6rem] font-bold leading-none text-gold-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 mt-2 text-lg">{s.h}</h3>
              <p className="text-[0.92rem] text-muted">{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Templates ---------------- */
const TEMPLATES = [
  { cls: "from-[#F4ECDD] via-gold-soft to-gold", sm: "Classic", nm: "Gold", tag: "Nổi bật", sub: "Sang trọng · Cổ điển" },
  { cls: "from-[#F7EEF0] via-[#E6C3CC] to-rose", sm: "Romantic", nm: "Rosé", sub: "Ngọt ngào · Lãng mạn" },
  { cls: "from-[#EEF2EA] via-[#C6D2BC] to-sage", sm: "Botanical", nm: "Sage", sub: "Tự nhiên · Thanh lịch" },
];

export function Templates() {
  return (
    <section id="templates">
      <div className="wrap">
        <div className="reveal mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-1 block font-script text-[1.7rem] text-rose">Bộ sưu tập</span>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.9rem)]">Mẫu thiệp tinh tế</h2>
          <p className="mt-3 text-muted">Chọn phong cách hợp với câu chuyện của bạn.</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-6">
          {TEMPLATES.map((t, i) => (
            <Link
              key={t.nm}
              href="/w/quan-linh"
              className="reveal group relative aspect-[3/4] overflow-hidden rounded-3xl shadow-soft-sm transition-shadow hover:shadow-soft"
              data-delay={i + 1}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${t.cls} transition-transform duration-700 group-hover:scale-105`} />
              {t.tag && (
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gold-deep">
                  {t.tag}
                </span>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white [text-shadow:0_2px_12px_rgba(0,0,0,.18)]">
                <span className="text-xs uppercase tracking-[0.22em] opacity-90">{t.sm}</span>
                <span className="my-1 font-script text-[2.4rem] leading-none">{t.nm}</span>
                <span className="text-xs uppercase tracking-[0.22em] opacity-90">{t.sub}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
const PLANS = [
  { name: "Cơ bản", cost: "199k", feats: ["1 mẫu thiệp Classic Gold", "Link riêng & RSVP", "Sổ lời chúc", "Đếm ngược & bản đồ"], cta: "Xem thử", ghost: true },
  { name: "Nâng cao", cost: "399k", feats: ["Tất cả gói Cơ bản", "Album ảnh không giới hạn", "Nhạc nền tuỳ chọn", "Link khách mời cá nhân hoá", "Xuất CSV & mã QR mừng cưới"], cta: "Bắt đầu ngay", featured: true },
  { name: "Trọn gói", cost: "799k", feats: ["Tất cả gói Nâng cao", "Thiết kế riêng theo yêu cầu", "Tên miền riêng", "Hỗ trợ ưu tiên 24/7"], cta: "Liên hệ tư vấn", ghost: true },
];

export function Pricing() {
  return (
    <section id="pricing" style={{ background: "linear-gradient(180deg,transparent,#F4ECDD 50%,transparent)" }}>
      <div className="wrap">
        <div className="reveal mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-1 block font-script text-[1.7rem] text-rose">Chi phí minh bạch</span>
          <h2 className="text-[clamp(1.8rem,4.5vw,2.9rem)]">Chọn gói phù hợp</h2>
          <p className="mt-3 text-muted">Thanh toán một lần cho mỗi đám cưới. Không phí ẩn.</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-stretch gap-6">
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              className={`reveal relative flex flex-col rounded-[22px] border bg-paper p-8 transition-transform duration-500 hover:-translate-y-2 hover:shadow-soft ${
                p.featured ? "border-gold shadow-soft" : "border-gold-soft/50"
              }`}
              data-delay={i + 1}
            >
              {p.featured && (
                <span className="absolute left-1/2 top-[-0.85rem] -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-br from-gold-light to-gold-deep px-4 py-1 text-xs font-semibold text-white">
                  Được chọn nhiều nhất
                </span>
              )}
              <div className="font-serif text-2xl">{p.name}</div>
              <div className="mb-1 mt-2 font-serif text-4xl text-gold-deep">
                {p.cost} <small className="font-sans text-sm text-muted">/ thiệp</small>
              </div>
              <ul className="my-6 flex flex-1 flex-col gap-3">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.93rem]">
                    <span className="text-sage">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/w/quan-linh" className={`btn w-full ${p.ghost ? "btn-ghost" : ""}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA + Footer ---------------- */
export function CtaBand() {
  return (
    <section>
      <div className="wrap">
        <div
          className="reveal relative overflow-hidden rounded-[28px] px-[clamp(2.4rem,6vw,4rem)] py-[clamp(2.4rem,6vw,4rem)] text-center text-white shadow-soft"
          style={{ background: "linear-gradient(135deg,#8A6D3B,#6f5729)" }}
        >
          <h2 className="text-[clamp(1.7rem,4.5vw,2.7rem)] text-white">Sẵn sàng kể câu chuyện của bạn?</h2>
          <p className="mx-auto mb-8 mt-4 max-w-lg text-white/80">
            Mở thử một thiệp mẫu ngay bây giờ và cảm nhận trải nghiệm mà khách mời của bạn sẽ có.
          </p>
          <Link href="/w/quan-linh" className="btn bg-white !text-gold-deep">
            💌 Mở thiệp mẫu
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#2b241d] px-6 pb-8 pt-14 text-center text-[#cdbfa9]">
      <div className="mb-4 font-serif text-xl font-bold text-gold-soft">Thiệp Ước</div>
      <div className="mx-auto mb-6 mt-4 flex flex-wrap justify-center gap-6 text-sm">
        <a href="#features" className="hover:text-white">Tính năng</a>
        <a href="#how" className="hover:text-white">Cách hoạt động</a>
        <a href="#templates" className="hover:text-white">Mẫu thiệp</a>
        <a href="#pricing" className="hover:text-white">Bảng giá</a>
      </div>
      <p className="mt-4 text-xs text-[#8a7d68]">
        © 2026 Thiệp Ước · Dịch vụ thiệp cưới online · Làm bằng ❤ cho những ngày trọng đại
      </p>
    </footer>
  );
}
