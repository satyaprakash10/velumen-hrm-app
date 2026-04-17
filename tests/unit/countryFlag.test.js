import { describe, it, expect } from "vitest";
import { flagEmojiFromIso2 } from "@/utils/countryFlag.js";

describe("countryFlag", () => {
  it("returns regional-indicator pair for ISO2", () => {
    expect(flagEmojiFromIso2("US")).toBe("🇺🇸");
    expect(flagEmojiFromIso2("gb")).toBe("🇬🇧");
  });

  it("returns empty for invalid codes", () => {
    expect(flagEmojiFromIso2("")).toBe("");
    expect(flagEmojiFromIso2("USA")).toBe("");
    expect(flagEmojiFromIso2("U")).toBe("");
  });
});
