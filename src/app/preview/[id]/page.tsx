import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/require-admin";
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
import { Interactions } from "@/components/ui/Interactions";
import { MusicPlayer } from "@/components/wedding/MusicPlayer";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Params = { params: { id: string } };

export default async function PreviewPage({ params }: Params) {
  await requireAdminSession();

  const wedding = await db.wedding.findUnique({
    where: { id: params.id },
    include: {
      events: { orderBy: { sortOrder: "asc" } },
      media: { orderBy: { sortOrder: "asc" } },
      wishes: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!wedding) notFound();

  // Cast — toPublicWeddingDto expects PublishedWedding but we allow any status for preview
  const dto = toPublicWeddingDto(wedding as Parameters<typeof toPublicWeddingDto>[0]);

  return (
    <>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-yellow-100 border-b border-yellow-300 px-4 py-2">
        <div className="mx-auto flex max-w-[640px] items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-yellow-800">🔍 Bản xem trước</span>
            <StatusBadge status={wedding.status} />
          </div>
          <Link
            href={`/admin/weddings/${params.id}/content`}
            className="rounded-md bg-yellow-200 px-3 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-300 transition-colors"
          >
            ← Quay lại chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Wedding template — same as /w/[slug] */}
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
            <p className="text-muted text-sm">RSVP form hiển thị trên trang công khai</p>
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
    </>
  );
}
