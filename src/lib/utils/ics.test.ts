import { describe, it, expect } from "vitest";
import {
  VN_TZID,
  VN_VTIMEZONE_LINES,
  formatIcsUtc,
  formatIcsLocalVN,
  escapeIcs,
} from "./ics";

describe("ics utils (FIX-11)", () => {
  it("formatIcsUtc trả về YYYYMMDDTHHMMSSZ", () => {
    expect(formatIcsUtc(new Date("2025-09-27T03:30:00.000Z"))).toBe("20250927T033000Z");
  });

  it("formatIcsLocalVN cộng đúng +07:00 và bỏ hậu tố Z", () => {
    // 03:30 UTC = 10:30 giờ Việt Nam
    expect(formatIcsLocalVN(new Date("2025-09-27T03:30:00.000Z"))).toBe("20250927T103000");
  });

  it("formatIcsLocalVN xử lý qua ngày (18:00 UTC → 01:00 hôm sau giờ VN)", () => {
    expect(formatIcsLocalVN(new Date("2025-09-27T18:00:00.000Z"))).toBe("20250928T010000");
  });

  it("escapeIcs escape backslash, chấm phẩy, phẩy, xuống dòng", () => {
    expect(escapeIcs("a\\b;c,d\ne")).toBe("a\\\\b\\;c\\,d\\ne");
    expect(escapeIcs("Nhà hàng ABC, Quận 1; tầng 2")).toBe("Nhà hàng ABC\\, Quận 1\\; tầng 2");
  });

  it("VTIMEZONE block hợp lệ cho Asia/Ho_Chi_Minh", () => {
    const block = VN_VTIMEZONE_LINES.join("\r\n");
    expect(block).toContain(`TZID:${VN_TZID}`);
    expect(block).toContain("TZOFFSETTO:+0700");
    expect(block.startsWith("BEGIN:VTIMEZONE")).toBe(true);
    expect(block.endsWith("END:VTIMEZONE")).toBe(true);
  });
});
