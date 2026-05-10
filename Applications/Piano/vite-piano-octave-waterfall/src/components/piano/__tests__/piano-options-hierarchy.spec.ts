import { describe, expect, it } from "vitest";
import { DefaultPianoRootConfiguration } from "../PianoRootConfiguration";

describe("Piano options hierarchy", () => {
  it("has root options with octave options containing tangent options", () => {
    const root = DefaultPianoRootConfiguration;

    expect(root).toBeDefined();
    expect(Array.isArray(root.octaves)).toBe(true);
    expect(root.octaves.length).toBeGreaterThan(0);

    for (const octave of root.octaves) {
      expect(octave).toBeDefined();
      expect(Array.isArray(octave.tangents)).toBe(true);
      expect(octave.tangents.length).toBe(12);
      expect(octave.tangent).toBeDefined();

      for (const tangent of octave.tangents) {
        expect(tangent.id.length).toBeGreaterThan(0);
        expect(tangent.note.length).toBeGreaterThan(0);
        expect(Array.isArray(tangent.geometry.points)).toBe(true);
        expect(tangent.geometry.points.length).toBeGreaterThan(0);
        expect(Array.isArray(tangent.polygon.points)).toBe(true);
        expect(tangent.polygon.points.length).toBeGreaterThan(0);

        const byNote = octave.tangent[tangent.note];
        expect(byNote).toBe(tangent);
      }
    }
  });
});
