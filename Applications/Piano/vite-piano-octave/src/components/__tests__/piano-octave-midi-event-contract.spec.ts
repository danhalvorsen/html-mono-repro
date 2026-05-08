import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("PianoOctave MIDI event contract", () => {
  it("TangentHoldStartDetail exposes the octave object and resolved MIDI note", () => {
    const source = readSource("src/application/PianoEventContracts.ts");

    expect(source).toMatch(/export\s+interface\s+PianoOctaveEventDetail\s*\{[\s\S]*readonly\s+index\s*:\s*number[\s\S]*\}/);
    expect(source).toMatch(/export\s+interface\s+TangentHoldStartDetail\s*\{[\s\S]*readonly\s+octave\s*:\s*PianoOctaveEventDetail[\s\S]*readonly\s+midiNote\s*:\s*number[\s\S]*\}/);
  });

  it("TangentHoldEndDetail exposes the octave object and resolved MIDI note", () => {
    const source = readSource("src/application/PianoEventContracts.ts");

    expect(source).toMatch(/export\s+interface\s+TangentHoldEndDetail\s*\{[\s\S]*readonly\s+octave\s*:\s*PianoOctaveEventDetail[\s\S]*readonly\s+midiNote\s*:\s*number[\s\S]*\}/);
  });

  it("piano-octave calculates MIDI from note plus octaveIndex before dispatch", () => {
    const source = readSource("src/components/piano-octave.ts");

    expect(source).not.toMatch(/midiNoteMapper\.toMidi\s*\(\s*note\s*\)/);
    expect(source).toMatch(/midiNoteMapper\.toMidi\s*\(\s*note\s*,\s*this\.octaveIndex\s*\)/);
  });

  it("every TangentHoldStart dispatch includes octave object and midiNote", () => {
    const source = readSource("src/components/piano-octave.ts");

    const blocks = Array.from(
      source.matchAll(
        /new\s+CustomEvent\s*<\s*TangentHoldStartDetail\s*>\s*\(\s*PianoEventName\.TangentHoldStart\s*,\s*\{[\s\S]*?\}\s*\)/g
      )
    ).map((match) => match[0]);

    expect(blocks.length).toBeGreaterThanOrEqual(2);

    for (const block of blocks) {
      expect(block).toMatch(/octaveIndex\s*:\s*this\.octaveIndex/);
      expect(block).toMatch(/octave\s*:\s*this\.createOctaveEventDetail\s*\(\s*\)/);
      expect(block).toMatch(/midiNote\s*:/);
    }
  });

  it("every TangentHoldEnd dispatch includes octave object and midiNote", () => {
    const source = readSource("src/components/piano-octave.ts");

    const blocks = Array.from(
      source.matchAll(
        /new\s+CustomEvent\s*<\s*TangentHoldEndDetail\s*>\s*\(\s*PianoEventName\.TangentHoldEnd\s*,\s*\{[\s\S]*?\}\s*\)/g
      )
    ).map((match) => match[0]);

    expect(blocks.length).toBeGreaterThanOrEqual(2);

    for (const block of blocks) {
      expect(block).toMatch(/octaveIndex\s*:\s*this\.octaveIndex/);
      expect(block).toMatch(/octave\s*:\s*this\.createOctaveEventDetail\s*\(\s*\)/);
      expect(block).toMatch(/midiNote\s*:/);
    }
  });

  it("held voices keep the resolved midiNote so hold-end can emit the same code", () => {
    const source = readSource("src/components/piano-octave.ts");

    expect(source).toMatch(/type\s+HeldVoice\s*=\s*\{[\s\S]*midiNote\s*:\s*number[\s\S]*\}/);
    expect(source).toMatch(/midiNote\s*:\s*voice\.midiNote/);
  });
});