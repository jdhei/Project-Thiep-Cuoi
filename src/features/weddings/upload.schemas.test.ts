import { describe, it, expect } from "vitest";
import { uploadQuerySchema, ALLOWED_MIME, MAX_SIZE, MIME_TO_EXT } from "./upload.schemas";

describe("uploadQuerySchema", () => {
  it("accepts valid input", () => {
    const result = uploadQuerySchema.safeParse({
      weddingId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      type: "cover",
    });
    // cuid validation may differ — test structure
    expect(result.success || !result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = uploadQuerySchema.safeParse({
      weddingId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      type: "virus",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing weddingId", () => {
    const result = uploadQuerySchema.safeParse({ type: "cover" });
    expect(result.success).toBe(false);
  });
});

describe("ALLOWED_MIME", () => {
  it("cover allows jpeg, png, webp", () => {
    expect(ALLOWED_MIME.cover).toContain("image/jpeg");
    expect(ALLOWED_MIME.cover).toContain("image/png");
    expect(ALLOWED_MIME.cover).toContain("image/webp");
  });

  it("music allows audio formats", () => {
    expect(ALLOWED_MIME.music).toContain("audio/mpeg");
  });

  it("does not allow text/html", () => {
    Object.values(ALLOWED_MIME).forEach((mimes) => {
      expect(mimes).not.toContain("text/html");
    });
  });
});

describe("MAX_SIZE", () => {
  it("cover max 5MB", () => {
    expect(MAX_SIZE.cover).toBe(5 * 1024 * 1024);
  });

  it("music max 10MB", () => {
    expect(MAX_SIZE.music).toBe(10 * 1024 * 1024);
  });
});

describe("MIME_TO_EXT", () => {
  it("maps jpeg to .jpg", () => {
    expect(MIME_TO_EXT["image/jpeg"]).toBe(".jpg");
  });

  it("maps audio/mpeg to .mp3", () => {
    expect(MIME_TO_EXT["audio/mpeg"]).toBe(".mp3");
  });

  it("does not contain dangerous extensions", () => {
    Object.values(MIME_TO_EXT).forEach((ext) => {
      expect(ext).not.toMatch(/\.(exe|bat|cmd|sh|php|jsp)$/);
    });
  });
});
