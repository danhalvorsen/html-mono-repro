import { describe, expect, it } from "vitest";
import { DefaultMidiNoteMapper } from "../src/application/DefaultMidiNoteMapper";

describe("DefaultMidiNoteMapper", () => {
  it("should map note symbol to midi number", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("C")).toBe(60);
    expect(mapper.toMidi("Fs")).toBe(66);
    expect(mapper.toMidi("H")).toBe(71);
  });

  it("should return null for unknown note symbol", () => {
    const mapper = new DefaultMidiNoteMapper();

    expect(mapper.toMidi("Q")).toBeNull();
  });
});
