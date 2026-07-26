import { describe, it, expect } from "vitest";
import {
  formatVnTime,
  formatVnDate,
  formatVnDateTime,
  formatVnDateLong,
  toVnDateInputValue,
  toVnDateTimeLocalValue,
  parseVnDateInput,
  parseVnDateTimeLocal,
} from "./datetime";

/**
 * FIX-14/15/16: các test này phải pass bất kể TZ của máy chạy test
 * (CI chạy UTC, dev chạy +07) — util neo tường minh vào Asia/Ho_Chi_Minh.
 */

// Sự kiện seed "Lễ Vu Quy": 08:00 ngày 20/12/2026 giờ VN = 01:00Z
const seedInstant = new Date("2026-12-20T01:00:00Z");

describe("format theo giờ VN", () => {
  it("hiển thị giờ sự kiện đúng giờ VN (regression FIX-14: trước đây ra 01:00)", () => {
    expect(formatVnTime(seedInstant)).toBe("08:00");
    expect(formatVnDateTime(seedInstant)).toBe("08:00 · 20/12/2026");
  });

  it("hiển thị ngày dạng dài cho hero thiệp", () => {
    expect(formatVnDateLong(seedInstant)).toBe("20 tháng 12 năm 2026");
  });

  it("không lệch ngày khi thời điểm rơi vào 0h–7h sáng giờ VN", () => {
    // 01:30 ngày 21/12 giờ VN = 18:30Z ngày 20/12 — ngày UTC là 20, ngày VN phải là 21
    expect(formatVnDate(new Date("2026-12-20T18:30:00Z"))).toBe("21/12/2026");
  });

  it("trả chuỗi rỗng với input không hợp lệ (không ném lỗi làm vỡ trang)", () => {
    expect(formatVnDateTime("not-a-date")).toBe("");
    expect(formatVnDate("")).toBe("");
  });
});

describe("parse giá trị từ form admin", () => {
  it("parse <input type='date'> thành 00:00 giờ VN (không phải 00:00 UTC)", () => {
    expect(parseVnDateInput("2026-12-20").toISOString()).toBe("2026-12-19T17:00:00.000Z");
  });

  it("parse <input type='datetime-local'> với offset +07:00 tường minh (regression FIX-16)", () => {
    expect(parseVnDateTimeLocal("2026-12-20T08:00").toISOString()).toBe(
      "2026-12-20T01:00:00.000Z",
    );
  });

  it("chấp nhận datetime-local kèm giây", () => {
    expect(parseVnDateTimeLocal("2026-12-20T08:00:30").toISOString()).toBe(
      "2026-12-20T01:00:30.000Z",
    );
  });
});

describe("round-trip form (hiển thị lại đúng giá trị đã nhập — chống lệch luỹ tiến)", () => {
  it("datetime-local: nhập 08:00 → lưu → form edit hiển thị lại 08:00", () => {
    const stored = parseVnDateTimeLocal("2026-12-20T08:00");
    expect(toVnDateTimeLocalValue(stored)).toBe("2026-12-20T08:00");
  });

  it("date input: nhập 2026-12-20 → lưu → form edit hiển thị lại 2026-12-20", () => {
    const stored = parseVnDateInput("2026-12-20");
    expect(toVnDateInputValue(stored)).toBe("2026-12-20");
  });

  it("date input hiển thị đúng cả với dữ liệu cũ lưu 08:00 sáng VN (seed)", () => {
    expect(toVnDateInputValue(seedInstant)).toBe("2026-12-20");
  });
});
