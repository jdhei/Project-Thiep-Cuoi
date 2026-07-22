import { describe, it, expect } from "vitest";
import { validatePublishReady } from "./wedding.validators";

function makeWedding(overrides: Record<string, unknown> = {}) {
  return {
    id: "cuid1",
    slug: "test-wedding",
    status: "DRAFT",
    groomName: "Quân",
    brideName: "Linh",
    weddingDate: new Date("2026-12-20"),
    title: "Wedding",
    introduction: null,
    loveStory: null,
    coverPath: "/uploads/cover.jpg",
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
    events: [
      {
        id: "ev1",
        weddingId: "cuid1",
        title: "Lễ cưới",
        startsAt: new Date(),
        address: "123 ABC",
        mapUrl: null,
        description: null,
        sortOrder: 0,
      },
    ],
    ...overrides,
  } as Parameters<typeof validatePublishReady>[0];
}

describe("validatePublishReady", () => {
  it("passes when all conditions met", () => {
    const result = validatePublishReady(makeWedding());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it("fails when weddingDate is missing", () => {
    const result = validatePublishReady(makeWedding({ weddingDate: null }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Chưa có ngày cưới");
  });

  it("fails when no events", () => {
    const result = validatePublishReady(makeWedding({ events: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Cần ít nhất 1 sự kiện");
  });

  it("fails when no cover", () => {
    const result = validatePublishReady(makeWedding({ coverPath: null }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Cần ảnh bìa (cover)");
  });

  it("fails when status is ARCHIVED", () => {
    const result = validatePublishReady(makeWedding({ status: "ARCHIVED" }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Thiệp đang archived — hãy unarchive trước khi publish");
  });

  it("collects multiple errors", () => {
    const result = validatePublishReady(
      makeWedding({ weddingDate: null, events: [], coverPath: null }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
});
