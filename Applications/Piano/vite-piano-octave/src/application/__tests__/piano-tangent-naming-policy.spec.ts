import { describe, expect, it } from "vitest";
import { NOTE_SYMBOLS } from "../../domain/NoteDomain";
import { DefaultPianoTangentNamingPolicy } from "../PianoTangentNamingPolicy";

describe("DefaultPianoTangentNamingPolicy", () => {
  it("creates tangent ids from note symbol and one-based octave number", () => {
    const policy = new DefaultPianoTangentNamingPolicy();

    for (let octaveIndex = 0; octaveIndex < 8; octaveIndex += 1) {
      for (const note of NOTE_SYMBOLS) {
        expect(policy.toTangentId(note, octaveIndex)).toBe(`${note}${octaveIndex + 1}`);
      }
    }
  });

  it("keeps the base note symbol intact", () => {
    const policy = new DefaultPianoTangentNamingPolicy();

    expect(policy.toTangentId("C", 0)).toBe("C1");
    expect(policy.toTangentId("Cs", 0)).toBe("Cs1");
    expect(policy.toTangentId("H", 6)).toBe("H7");
  });

  it("rejects invalid note symbols", () => {
    const policy = new DefaultPianoTangentNamingPolicy();

    expect(() => policy.toTangentId("X", 0)).toThrow("Invalid note symbol");
  });

  it("rejects invalid octave indexes", () => {
    const policy = new DefaultPianoTangentNamingPolicy();

    expect(() => policy.toTangentId("C", -1)).toThrow("Invalid octave index");
    expect(() => policy.toTangentId("C", 1.5)).toThrow("Invalid octave index");
  });
});