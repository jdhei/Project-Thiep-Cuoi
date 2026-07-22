import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublishedWeddingBySlug } from "@/features/weddings/wedding.repository";
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

type Params = { params: { slug: string } };

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

export default async function WeddingPage({ params }: Params) {
  const wedding = await findPublishedWeddingBySlug(params.slug);
  // Chỉ thiệp PUBLISHED mới hiển thị; DRAFT/ARCHIVED → 404.
  if (!wedding) notFound();

  const dto = toPublicWeddingDto(wedding);

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
        </SectionShell>
      )}

      {dto.visibility.gallery && (
        <SectionShell kick="Khoảnh khắc đẹp" title="Album ảnh">
          <Gallery items={dto.gallery} />
        </SectionShell>
      )}

      {dto.visibility.rsvp && (
        <SectionShell kick="Xác nhận tham dự" title="RSVP">
          <RsvpForm slug={params.slug} />
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
