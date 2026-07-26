import { describe, it, expect } from "vitest";
import { createEventSchema, updateEventSchema } from "./event.schemas";

const base = {
  title: "Lễ Vu Quy",
  address: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
};

/**
 * FIX-16 regression: form admin dùng <input type="datetime-local"> nên
 * startsAt đến server ở dạng "yyyy-MM-ddTHH:mm" (không giây, không timezone).
 * Schema cũ (z.string().datetime()) từ chối format này → không thể tạo/sửa
 * sự kiện qua UI.
 */
describe("createEventSchema — startsAt", () => {
  it("chấp nhận 'yyyy-MM-ddTHH:mm' từ <input type='datetime-local'> (regression FIX-16)", () => {
    const result = createEventSchema.safeParse({ ...base, startsAt: "2026-12-20T08:00" });
    expect(result.success).toBe(true);
  });

  it("chấp nhận kèm giây 'yyyy-MM-ddTHH:mm:ss'", () => {
    const result = createEventSchema.safeParse({ ...base, startsAt: "2026-12-20T08:00:30" });
    expect(result.success).toBe(true);
  });

  it("từ chối chuỗi tuỳ ý", () => {
    expect(createEventSchema.safeParse({ ...base, startsAt: "hello" }).success).toBe(false);
  });

  it("từ chối khi chỉ có ngày (thiếu giờ)", () => {
    expect(createEventSchema.safeParse({ ...base, startsAt: "2026-12-20" }).success).toBe(false);
  });

  it("từ chối thời gian không tồn tại trên lịch", () => {
    expect(
      createEventSchema.safeParse({ ...base, startsAt: "2026-13-45T99:99" }).success,
    ).toBe(false);
  });

  it("từ chối khi thiếu startsAt", () => {
    expect(createEventSchema.safeParse(base).success).toBe(false);
  });
});

describe("updateEventSchema", () => {
  it("chấp nhận datetime-local + coerce sortOrder từ chuỗi form", () => {
    const result = updateEventSchema.safeParse({
      ...base,
      startsAt: "2026-12-20T11:00",
      sortOrder: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sortOrder).toBe(3);
  });
});
