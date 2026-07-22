import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublishedWeddingBySlug } from "@/features/weddings/wedding.repository";
import { db } from "@/lib/db";
import { toPublicWeddingDto } from "@/features/weddings/public-dto";
import { Countdown } from "@/components/wedding/Countdown";
import {
  WeddingHero,
  SectionShell,
  LoveStory,
  EventTimeline,
  Gallery,
  GiftSection,
  WishList,
} from "@/components/wedding/sections";
import { RsvpForm } from "@/components/wedding/RsvpForm";
import { WishForm } from "@/components/wedding/WishForm";
import { Interactions } from "@/components/ui/Interactions";
import { MusicPlayer } from "@/components/wedding/MusicPlayer";

export const dynamic = "force-dynamic";

type Params = {
  params: { slug: string };
  searchParams: { guest?: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const w = await findPublishedWeddingBySlug(params.slug);
  if (!w) return { title: "Không tìm thấy thiệp" };
  const title = `${w.groomName} & ${w.brideName} · Thiệp cưới`;
  return {
    title,
    description: w.introduction ?? "Trân trọng kính mời bạn đến chung vui.",
    openGraph: { title, type: "website" },
  };
}

export default async function WeddingPage({ params, searchParams }: Params) {
  const wedding = await findPublishedWeddingBySlug(params.slug);
  // Chỉ thiệp PUBLISHED mới hiển thị; DRAFT/ARCHIVED → 404.
  if (!wedding) notFound();

  const dto = toPublicWeddingDto(wedding);

  // GUEST-03: nếu có ?guest=code, tra cứu khách mời để tự điền tên & giới hạn số người.
  const guestCode = searchParams.guest?.trim().toUpperCase();
  const guest = guestCode
    ? await db.guest.findFirst({
        where: { weddingId: wedding.id, invitationCode: guestCode },
        select: { fullName: true, maximumPeople: true, invitationCode: true, personalizedMessage: true },
      })
    : null;

  return (
    <main className="mx-auto min-h-screen max-w-[640px] bg-paper">
      <WeddingHero dto={dto} />

      {dto.visibility.countdown && dto.weddingDate && (
        <SectionShell kick="Đếm từng khoảnh khắc" title="Còn lại">
          <Countdown target={dto.weddingDate} />
        </SectionShell>
      )}

      {dto.visibility.story && dto.loveStory && (
        <SectionShell kick="Chuyện của chúng mình" title="Từ xa lạ đến trọn đời">
          <LoveStory text={dto.loveStory} />
        </SectionShell>
      )}

      {dto.events.length > 0 && (
        <SectionShell kick="Lịch trình" title="Sự kiện">
          <EventTimeline events={dto.events} />
          <div className="mt-6 text-center">
            <a
              href={`/api/calendar/${params.slug}`}
              className="inline-block rounded-full border border-gold-soft/60 px-5 py-2 text-sm font-medium text-gold-deep transition-colors hover:bg-gold-soft/20"
            >
              📅 Thêm vào lịch
            </a>
          </div>
        </SectionShell>
      )}

      {dto.visibility.gallery && (
        <SectionShell kick="Khoảnh khắc đẹp" title="Album ảnh">
          <Gallery items={dto.gallery} />
        </SectionShell>
      )}

      {dto.visibility.rsvp && (
        <SectionShell kick="Xác nhận tham dự" title="RSVP">
          {guest?.personalizedMessage && (
            <p className="mx-auto mb-4 max-w-md text-center font-cormorant text-[1.15rem] text-gold-deep">
              {guest.personalizedMessage}
            </p>
          )}
          <RsvpForm
            slug={params.slug}
            presetName={guest?.fullName}
            invitationCode={guest?.invitationCode}
            maxPeople={guest?.maximumPeople}
          />
        </SectionShell>
      )}

      {dto.visibility.gift && (
        <SectionShell kick="Mừng cưới" title="Gửi quà" tinted>
          <GiftSection giftData={dto.giftData} />
        </SectionShell>
      )}

      {dto.visibility.wishes && (
        <SectionShell kick="Gửi trao yêu thương" title="Sổ lời chúc" tinted>
          <WishList wishes={dto.wishes} />
          <WishForm slug={params.slug} />
        </SectionShell>
      )}

      <section className="border-t border-gold-soft/30 py-12 text-center">
        <div className="font-script text-[2.4rem] text-rose">Cảm ơn ♡</div>
        <p className="mt-2 text-muted">
          {dto.couple.groomName} &amp; {dto.couple.brideName}
        </p>
      </section>

      <Interactions />
      {dto.visibility.music && dto.musicUrl && (
        <MusicPlayer src={dto.musicUrl} />
      )}
    </main>
  );
}
