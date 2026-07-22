import { describe, it, expect } from "vitest";
import { createGuestSchema, generateInvitationCode } from "./guest.schemas";

describe("createGuestSchema", () => {
  const valid = { fullName: "Nguyễn Văn A", maximumPeople: 2 };

  it("accepts valid input", () => {
    expect(createGuestSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults maximumPeople to 1 when omitted", () => {
    const result = createGuestSchema.safeParse({ fullName: "Trần Thị B" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.maximumPeople).toBe(1);
  });

  it("rejects name shorter than 2 chars", () => {
    expect(createGuestSchema.safeParse({ ...valid, fullName: "A" }).success).toBe(false);
  });

  it("rejects maximumPeople < 1", () => {
    expect(createGuestSchema.safeParse({ ...valid, maximumPeople: 0 }).success).toBe(false);
  });

  it("rejects maximumPeople > 20", () => {
    expect(createGuestSchema.safeParse({ ...valid, maximumPeople: 21 }).success).toBe(false);
  });

  it("coerces numeric string for maximumPeople", () => {
    const result = createGuestSchema.safeParse({ ...valid, maximumPeople: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.maximumPeople).toBe(3);
  });
});

describe("generateInvitationCode", () => {
  it("generates code of requested length", () => {
    expect(generateInvitationCode(8)).toHaveLength(8);
  });

  it("uses only unambiguous alphabet (no 0/O/1/I/L)", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateInvitationCode()).toMatch(/^[A-HJ-NP-Z2-9]+$/);
    }
  });

  it("produces different codes across calls", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInvitationCode()));
    expect(codes.size).toBeGreaterThan(90);
  });
});
