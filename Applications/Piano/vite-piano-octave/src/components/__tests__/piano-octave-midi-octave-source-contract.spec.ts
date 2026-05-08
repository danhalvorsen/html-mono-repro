import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readPianoOctaveSource(): string {
  return readFileSync(
    resolve(process.cwd(), "src/components/piano-octave.ts"),
    "utf8"
  );
}

describe("PianoOctave MIDI octave source contract", () => {
  it("does not map playback notes without octave index", () => {
    const source = readPianoOctaveSource();

    expect(source).not.toMatch(/midiNoteMapper\.toMidi\s*\(\s*note\s*\)/);
  });

  it("maps playback notes using the component octaveIndex", () => {
    const source = readPianoOctaveSource();

    const matches = source.match(
      /midiNoteMapper\.toMidi\s*\(\s*note\s*,\s*this\.octaveIndex\s*\)/g
    );

    expect(matches ?? []).toHaveLength(2);
  });
});