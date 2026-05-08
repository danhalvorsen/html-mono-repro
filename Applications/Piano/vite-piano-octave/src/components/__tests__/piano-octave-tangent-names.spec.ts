import { describe, expect, it } from "vitest";
import { NOTE_SYMBOLS } from "../../domain/NoteDomain";
import { DefaultPianoTangentNamingPolicy } from "../../application/PianoTangentNamingPolicy";

describe("Piano octave tangent naming contract", () => {
  it("creates the correct tangent id for every note in every octave", () => {
    const policy = new DefaultPianoTangentNamingPolicy();
    const octaveCount = 7;

    for (let octaveIndex = 0; octaveIndex < octaveCount; octaveIndex += 1) {
      for (const note of NOTE_SYMBOLS) {
        const tangentId = policy.toTangentId(note, octaveIndex);

        expect(tangentId, `${note} octave ${octaveIndex}`).toBe(`${note}${octaveIndex + 1}`);
      }
    }
  });

  it("does not give the same id to equal notes in different octaves", () => {
    const policy = new DefaultPianoTangentNamingPolicy();

    expect(policy.toTangentId("C", 0)).toBe("C1");
    expect(policy.toTangentId("C", 1)).toBe("C2");
    expect(policy.toTangentId("C", 2)).toBe("C3");

    expect(policy.toTangentId("C", 0)).not.toBe(policy.toTangentId("C", 1));
    expect(policy.toTangentId("C", 1)).not.toBe(policy.toTangentId("C", 2));
  });

  it("creates a unique id for every tangent in a multi-octave keyboard", () => {
    const policy = new DefaultPianoTangentNamingPolicy();
    const octaveCount = 7;
    const ids: string[] = [];

    for (let octaveIndex = 0; octaveIndex < octaveCount; octaveIndex += 1) {
      for (const note of NOTE_SYMBOLS) {
        ids.push(policy.toTangentId(note, octaveIndex));
      }
    }

    expect(ids).toHaveLength(octaveCount * NOTE_SYMBOLS.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps note symbol and tangent id as separate concepts", () => {
    const policy = new DefaultPianoTangentNamingPolicy();

    const note = "C";
    const octaveIndex = 1;
    const tangentId = policy.toTangentId(note, octaveIndex);

    expect(note).toBe("C");
    expect(tangentId).toBe("C2");
  });
});