import type { PublishedWedding } from "./wedding.repository";

/**
 * DTO cho trang public. TUYỆT ĐỐI không chứa dữ liệu nhạy cảm:
 * phone khách, ipHash, submissionKey, ghi chú nội bộ, danh sách guest...
 */
export type PublicEventDto = {
  id: string;
  title: string;
  startsAt: string; // ISO
  address: string;
  mapUrl: string | null;
  description: string | null;
};

export type PublicGalleryItem = { id: string; url: string; caption: string | null };

export type PublicWishDto = { guestName: string; content: string; createdAt: string };

export type PublicWeddingDto = {
  slug: string;
  couple: { groomName: string; brideName: string };
  weddingDate: string | null;
  title: string | null;
  introduction: string | null;
  loveStory: string | null;
  coverUrl: string | null;
  musicUrl: string | null;
  primaryColor: string;
  events: PublicEventDto[];
  gallery: PublicGalleryItem[];
  wishes: PublicWishDto[];
  visibility: {
    countdown: boolean;
    story: boolean;
    gallery: boolean;
    rsvp: boolean;
    wishes: boolean;
    gift: boolean;
    music: boolean;
  };
};

function mediaUrl(id: string): string {
  return `/media/${id}`;
}

/** Chuyển Prisma model (đã include events/media/wishes) thành DTO an toàn cho public. */
export function toPublicWeddingDto(w: PublishedWedding): PublicWeddingDto {
  const cover = w.media.find((m) => m.type === "cover");
  const music = w.media.find((m) => m.type === "music");
  const gallery = w.media.filter((m) => m.type === "gallery");

  return {
    slug: w.slug,
    couple: { groomName: w.groomName, brideName: w.brideName },
    weddingDate: w.weddingDate ? w.weddingDate.toISOString() : null,
    title: w.title,
    introduction: w.introduction,
    loveStory: w.loveStory,
    coverUrl: cover ? mediaUrl(cover.id) : null,
    musicUrl: w.showMusic && music ? mediaUrl(music.id) : null,
    primaryColor: w.primaryColor ?? "#8A6D3B",
    events: w.events.map((e) => ({
      id: e.id,
      title: e.title,
      startsAt: e.startsAt.toISOString(),
      address: e.address,
      mapUrl: e.mapUrl,
      description: e.description,
    })),
    gallery: gallery.map((g) => ({ id: g.id, url: mediaUrl(g.id), caption: g.caption })),
    wishes: w.wishes.map((wi) => ({
      guestName: wi.guestName,
      content: wi.content,
      createdAt: wi.createdAt.toISOString(),
    })),
    visibility: {
      countdown: w.showCountdown,
      story: w.showStory,
      gallery: w.showGallery,
      rsvp: w.showRsvp,
      wishes: w.showWishes,
      gift: w.showGift,
      music: w.showMusic,
    },
  };
}
