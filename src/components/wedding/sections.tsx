import { format } from "date-fns";
import type { PublicWeddingDto } from "@/features/weddings/public-dto";

function fmt(iso: string): string {
  try {
    return format(new Date(iso), "HH:mm · dd/MM/yyyy");
  } catch {
    return iso;
  }
}

export function WeddingHero({ dto }: { dto: PublicWeddingDto }) {
  const dateLabel = dto.weddingDate ? format(new Date(dto.weddingDate), "dd 'tháng' MM 'năm' yyyy") : null;
  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center"
      style={{ background: "radial-gradient(120% 80% at 50% 0%,#fff,#F4ECDD)" }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-3.5 rounded border border-gold-soft" />
      <span className="text-xs uppercase tracking-[0.3em] text-gold-deep">
        {dto.title ?? "Trân trọng kính mời"}
      </span>
      <div className="my-4 font-script text-[clamp(3rem,13vw,5rem)] leading-none text-rose">
        {dto.couple.groomName}
        <span className="block text-[0.55em] text-gold">&amp;</span>
        {dto.couple.brideName}
      </div>
      {dateLabel && <p className="font-cormorant text-[1.4rem] tracking-wide text-ink">{dateLabel}</p>}
    </section>
  );
}

export function SectionShell({
  kick,
  title,
  children,
  tinted,
}: {
  kick: string;
  title: string;
  children: React.ReactNode;
  tinted?: boolean;
}) {
  return (
    <section
      className="border-t border-gold-soft/30 px-[clamp(1.2rem,6vw,3rem)] py-[clamp(2.6rem,9vw,4.5rem)] text-center"
      style={tinted ? { background: "linear-gradient(180deg,#F4ECDD,transparent)" } : undefined}
    >
      <span className="font-script text-[1.6rem] text-rose">{kick}</span>
      <h3 className="mb-6 mt-1 font-serif text-[1.7rem]">{title}</h3>
      {children}
    </section>
  );
}

export function LoveStory({ text }: { text: string }) {
  return (
    <p className="mx-auto max-w-md font-cormorant text-[1.22rem] leading-[1.8] text-muted">{text}</p>
  );
}

export function EventTimeline({ events }: { events: PublicWeddingDto["events"] }) {
  return (
    <div className="relative mx-auto max-w-md pl-8 text-left">
      <div className="absolute bottom-1.5 left-[7px] top-1.5 w-0.5 bg-gradient-to-b from-gold-soft to-transparent" />
      {events.map((e) => (
        <div key={e.id} className="relative pb-7">
          <span className="absolute left-[-2rem] top-1 h-4 w-4 rounded-full border-[3px] border-gold bg-paper shadow-[0_0_0_4px_rgba(230,211,172,.4)]" />
          <h4 className="font-serif text-lg text-gold-deep">{e.title}</h4>
          <div className="my-0.5 text-sm font-semibold text-rose">{fmt(e.startsAt)}</div>
          <div className="text-[0.92rem] text-muted">{e.address}</div>
          {e.mapUrl && (
            <a
              href={e.mapUrl}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-gold-deep"
            >
              📍 Xem bản đồ
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export function WishList({ wishes }: { wishes: PublicWeddingDto["wishes"] }) {
  if (wishes.length === 0) {
    return <p className="text-muted">Chưa có lời chúc nào được duyệt.</p>;
  }
  return (
    <div className="mx-auto flex max-w-md flex-col gap-3.5 text-left">
      {wishes.map((w, i) => (
        <div
          key={`${w.guestName}-${i}`}
          className="rounded-2xl border border-gold-soft/40 bg-paper px-5 py-4 shadow-soft-sm"
        >
          <div className="font-serif text-[0.98rem] font-semibold text-gold-deep">{w.guestName}</div>
          <div className="mt-0.5 font-cormorant text-[1.05rem] text-muted">{w.content}</div>
        </div>
      ))}
    </div>
  );
}
