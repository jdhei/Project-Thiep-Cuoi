import { describe, it, expect } from "vitest";
import { createWeddingSchema, updateWeddingSchema } from "./wedding.schemas";

const base = {
  groomName: "Quân",
  brideName: "Linh",
  slug: "quan-linh",
};

/**
 * FIX-15 regression: form admin dùng <input type="date"> nên weddingDate đến
 * server ở dạng "yyyy-MM-dd". Schema cũ (z.string().datetime()) từ chối format
 * này → không thể lưu ngày cưới qua UI, và mọi lần lưu trang Nội dung của
 * thiệp đã có ngày đều fail.
 */
describe("createWeddingSchema — weddingDate", () => {
  it("chấp nhận 'yyyy-MM-dd' từ <input type='date'> (regression FIX-15)", () => {
    const result = createWeddingSchema.safeParse({ ...base, weddingDate: "2026-12-20" });
    expect(result.success).toBe(true);
  });

  it("chấp nhận bỏ trống (chuỗi rỗng) và không truyền", () => {
    expect(createWeddingSchema.safeParse({ ...base, weddingDate: "" }).success).toBe(true);
    expect(createWeddingSchema.safeParse(base).success).toBe(true);
  });

  it("từ chối chuỗi không phải ngày", () => {
    expect(createWeddingSchema.safeParse({ ...base, weddingDate: "hello" }).success).toBe(false);
  });

  it("từ chối ngày không tồn tại trên lịch", () => {
    expect(
      createWeddingSchema.safeParse({ ...base, weddingDate: "2026-13-45" }).success,
    ).toBe(false);
  });
});

describe("updateWeddingSchema — weddingDate", () => {
  it("chấp nhận 'yyyy-MM-dd' (regression FIX-15: lưu trang Nội dung khi đã có ngày)", () => {
    const result = updateWeddingSchema.safeParse({ ...base, weddingDate: "2026-12-20" });
    expect(result.success).toBe(true);
  });

  it("từ chối ISO datetime đầy đủ (form không bao giờ gửi dạng này)", () => {
    const result = updateWeddingSchema.safeParse({
      ...base,
      weddingDate: "2026-12-20T08:00:00Z",
    });
    expect(result.success).toBe(false);
  });
});
