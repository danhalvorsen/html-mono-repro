import { describe, expect, it } from "vitest";
import { DefaultFallingColumnMapper } from "../src/application/DefaultFallingColumnMapper";

describe("DefaultFallingColumnMapper", () => {
  it("should map note and octave index to deterministic column", () => {
    const mapper = new DefaultFallingColumnMapper();

    expect(mapper.toColumn("C", 0)).toBe(0);
    expect(mapper.toColumn("As", 1)).toBe(22);
    expect(mapper.toColumn("H", 3)).toBe(47);
  });

  it("should return null for invalid note", () => {
    const mapper = new DefaultFallingColumnMapper();

    expect(mapper.toColumn("X", 0)).toBeNull();
  });

  it("should return null for invalid octave index", () => {
    const mapper = new DefaultFallingColumnMapper();

    expect(mapper.toColumn("C", -1)).toBeNull();
    expect(mapper.toColumn("C", 1.5)).toBeNull();
  });
});
