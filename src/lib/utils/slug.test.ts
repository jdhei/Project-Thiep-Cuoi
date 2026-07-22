import { describe, it, expect } from "vitest";
import { slugSchema, slugify, RESERVED_SLUGS } from "./slug";

describe("slugSchema", () => {
  it("chấp nhận slug hợp lệ", () => {
    expect(slugSchema.safeParse("quan-linh").success).toBe(true);
    expect(slugSchema.safeParse("abc123").success).toBe(true);
  });

  it("từ chối dấu tiếng Việt và khoảng trắng", () => {
    expect(slugSchema.safeParse("quân-linh").success).toBe(false);
    expect(slugSchema.safeParse("quan linh").success).toBe(false);
  });

  it("từ chối ký tự đặc biệt và gạch đầu/cuối", () => {
    expect(slugSchema.safeParse("quan_linh").success).toBe(false);
    expect(slugSchema.safeParse("-quan").success).toBe(false);
    expect(slugSchema.safeParse("quan-").success).toBe(false);
  });

  it("từ chối từ khoá dành riêng", () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(slugSchema.safeParse(reserved).success).toBe(false);
    }
  });

  it("từ chối quá ngắn / quá dài", () => {
    expect(slugSchema.safeParse("ab").success).toBe(false);
    expect(slugSchema.safeParse("a".repeat(61)).success).toBe(false);
  });
});

describe("slugify", () => {
  it("chuyển tiếng Việt có dấu thành slug", () => {
    expect(slugify("Quân & Linh")).toBe("quan-linh");
    expect(slugify("Đám cưới Đông Đô")).toBe("dam-cuoi-dong-do");
    expect(slugify("  Nhiều   khoảng trắng  ")).toBe("nhieu-khoang-trang");
  });
});
