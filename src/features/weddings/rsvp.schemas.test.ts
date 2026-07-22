import { describe, it, expect } from "vitest";
import { rsvpSubmissionSchema, wishSubmissionSchema } from "./rsvp.schemas";

describe("rsvpSubmissionSchema", () => {
  const valid = {
    fullName: "Nguyễn Văn A",
    attendance: "ATTENDING" as const,
    numberOfPeople: 2,
  };

  it("accepts valid input", () => {
    expect(rsvpSubmissionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects negative numberOfPeople", () => {
    const result = rsvpSubmissionSchema.safeParse({ ...valid, numberOfPeople: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects numberOfPeople > 20", () => {
    const result = rsvpSubmissionSchema.safeParse({ ...valid, numberOfPeople: 21 });
    expect(result.success).toBe(false);
  });

  it("rejects NOT_ATTENDING with numberOfPeople > 0", () => {
    const result = rsvpSubmissionSchema.safeParse({
      ...valid,
      attendance: "NOT_ATTENDING",
      numberOfPeople: 2,
    });
    expect(result.success).toBe(false);
  });

  it("accepts NOT_ATTENDING with numberOfPeople = 0", () => {
    const result = rsvpSubmissionSchema.safeParse({
      ...valid,
      attendance: "NOT_ATTENDING",
      numberOfPeople: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects short fullName", () => {
    const result = rsvpSubmissionSchema.safeParse({ ...valid, fullName: "A" });
    expect(result.success).toBe(false);
  });
});

describe("wishSubmissionSchema", () => {
  it("accepts valid wish", () => {
    const result = wishSubmissionSchema.safeParse({
      guestName: "Minh",
      content: "Chúc mừng hạnh phúc!",
    });
    expect(result.success).toBe(true);
  });

  it("strips control characters", () => {
    const result = wishSubmissionSchema.safeParse({
      guestName: "Minh",
      content: "Hello\x00World\x01!",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("HelloWorld!");
    }
  });

  it("rejects empty content", () => {
    const result = wishSubmissionSchema.safeParse({
      guestName: "Minh",
      content: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short guestName", () => {
    const result = wishSubmissionSchema.safeParse({
      guestName: "M",
      content: "Chúc mừng!",
    });
    expect(result.success).toBe(false);
  });
});
