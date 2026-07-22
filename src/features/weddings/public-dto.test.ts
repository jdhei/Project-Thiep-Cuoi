import { describe, it, expect } from "vitest";
import { toPublicWeddingDto } from "./public-dto";
import type { PublishedWedding } from "./wedding.repository";

function makeWedding(overrides: Partial<PublishedWedding> = {}): PublishedWedding {
  const base = {
    id: "w1",
    slug: "quan-linh",
    status: "PUBLISHED",
    groomName: "Quân",
    brideName: "Linh",
    weddingDate: new Date("2026-12-20T01:00:00.000Z"),
    title: "Kính mời",
    introduction: "intro",
    loveStory: "story",
    coverPath: null,
    musicPath: null,
    primaryColor: "#8A6D3B",
    showCountdown: true,
    showStory: true,
    showGallery: true,
    showRsvp: true,
    showWishes: true,
    showGift: false,
    showMusic: true,
    giftData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    events: [],
    media: [],
    wishes: [],
  };
  return { ...base, ...overrides } as PublishedWedding;
}

describe("toPublicWeddingDto", () => {
  it("KHÔNG lộ dữ liệu nhạy cảm (phone/ipHash/submissionKey/guest)", () => {
    const dto = toPublicWeddingDto(makeWedding());
    const json = JSON.stringify(dto);
    expect(json).not.toContain("ipHash");
    expect(json).not.toContain("submissionKey");
    expect(json).not.toContain("phone");
    expect(Object.keys(dto)).not.toContain("guests");
  });

  it("map đúng thông tin cặp đôi và visibility", () => {
    const dto = toPublicWeddingDto(makeWedding());
    expect(dto.couple).toEqual({ groomName: "Quân", brideName: "Linh" });
    expect(dto.visibility.rsvp).toBe(true);
    expect(dto.visibility.gift).toBe(false);
  });

  it("ẩn musicUrl khi showMusic = false", () => {
    const dto = toPublicWeddingDto(
      makeWedding({
        showMusic: false,
        media: [
          {
            id: "m1",
            weddingId: "w1",
            type: "music",
            path: "music/x.mp3",
            mimeType: "audio/mpeg",
            sizeBytes: 1,
            caption: null,
            sortOrder: 0,
            createdAt: new Date(),
          },
        ],
      }),
    );
    expect(dto.musicUrl).toBeNull();
  });
});
