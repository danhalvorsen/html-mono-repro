import { describe, expect, it } from "vitest";
import { DefaultMidiNoteMapper } from "../src/application/DefaultMidiNoteMapper";

describe("DefaultMidiNoteMapper", () => {
  it("keeps the legacy base-note mapping when octave index is not provided", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("C")).toBe(60);
    expect(mapper.toMidi("Cs")).toBe(61);
    expect(mapper.toMidi("D")).toBe(62);
    expect(mapper.toMidi("Ds")).toBe(63);
    expect(mapper.toMidi("E")).toBe(64);
    expect(mapper.toMidi("F")).toBe(65);
    expect(mapper.toMidi("Fs")).toBe(66);
    expect(mapper.toMidi("G")).toBe(67);
    expect(mapper.toMidi("Gs")).toBe(68);
    expect(mapper.toMidi("A")).toBe(69);
    expect(mapper.toMidi("As")).toBe(70);
    expect(mapper.toMidi("H")).toBe(71);
  });

  it("maps visual octave index 3 to the legacy middle octave", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("C", 3)).toBe(60);
    expect(mapper.toMidi("D", 3)).toBe(62);
    expect(mapper.toMidi("H", 3)).toBe(71);
  });

  it("maps the same note in different visual octaves to different MIDI notes", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("C", 0)).toBe(24);
    expect(mapper.toMidi("C", 1)).toBe(36);
    expect(mapper.toMidi("C", 2)).toBe(48);
    expect(mapper.toMidi("C", 3)).toBe(60);
    expect(mapper.toMidi("C", 4)).toBe(72);
    expect(mapper.toMidi("C", 5)).toBe(84);
    expect(mapper.toMidi("C", 6)).toBe(96);
  });

  it("keeps semitone differences inside the selected octave", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("C", 4)).toBe(72);
    expect(mapper.toMidi("Cs", 4)).toBe(73);
    expect(mapper.toMidi("D", 4)).toBe(74);
    expect(mapper.toMidi("H", 4)).toBe(83);
  });

  it("rejects invalid note symbols", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("X")).toBeNull();
    expect(mapper.toMidi("X", 3)).toBeNull();
  });

  it("rejects invalid octave indexes", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("C", -1)).toBeNull();
    expect(mapper.toMidi("C", 1.5)).toBeNull();
    expect(mapper.toMidi("C", Number.NaN)).toBeNull();
  });

  it("rejects values outside MIDI range", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("C", 20)).toBeNull();
  });
});