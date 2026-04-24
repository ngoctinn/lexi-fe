import { extractDeliveryCue, getCueEmoji, getCueLabel } from "../delivery-cue";

describe("delivery-cue utilities", () => {
  describe("extractDeliveryCue", () => {
    it("should extract cue from start of text", () => {
      const result = extractDeliveryCue("[warmly] Hello, how are you?");
      expect(result.cue).toBe("warmly");
      expect(result.cleanText).toBe("Hello, how are you?");
    });

    it("should handle cue with extra whitespace", () => {
      const result = extractDeliveryCue("  [encouragingly]   Let's try again!");
      expect(result.cue).toBe("encouragingly");
      expect(result.cleanText).toBe("Let's try again!");
    });

    it("should return null cue if no cue present", () => {
      const result = extractDeliveryCue("Just a normal response");
      expect(result.cue).toBeNull();
      expect(result.cleanText).toBe("Just a normal response");
    });

    it("should handle empty string", () => {
      const result = extractDeliveryCue("");
      expect(result.cue).toBeNull();
      expect(result.cleanText).toBe("");
    });

    it("should not extract cue if brackets not at start", () => {
      const result = extractDeliveryCue("Hello [warmly] there");
      expect(result.cue).toBeNull();
      expect(result.cleanText).toBe("Hello [warmly] there");
    });

    it("should handle multiple cue-like patterns (only first)", () => {
      const result = extractDeliveryCue("[warmly] Hello [again]");
      expect(result.cue).toBe("warmly");
      expect(result.cleanText).toBe("Hello [again]");
    });
  });

  describe("getCueEmoji", () => {
    it("should return correct emoji for known cues", () => {
      expect(getCueEmoji("warmly")).toBe("🤗");
      expect(getCueEmoji("encouragingly")).toBe("💪");
      expect(getCueEmoji("gently")).toBe("🌸");
      expect(getCueEmoji("enthusiastically")).toBe("🎉");
    });

    it("should return default emoji for unknown cues", () => {
      expect(getCueEmoji("unknown")).toBe("💬");
    });

    it("should return empty string for null cue", () => {
      expect(getCueEmoji(null)).toBe("");
    });

    it("should be case-insensitive", () => {
      expect(getCueEmoji("WARMLY")).toBe("🤗");
      expect(getCueEmoji("Encouragingly")).toBe("💪");
    });
  });

  describe("getCueLabel", () => {
    it("should capitalize cue name", () => {
      expect(getCueLabel("warmly")).toBe("Warmly");
      expect(getCueLabel("encouragingly")).toBe("Encouragingly");
    });

    it("should return empty string for null cue", () => {
      expect(getCueLabel(null)).toBe("");
    });

    it("should handle already capitalized cues", () => {
      expect(getCueLabel("Warmly")).toBe("Warmly");
    });
  });
});
