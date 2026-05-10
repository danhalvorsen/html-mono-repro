import { describe, expect, it } from "vitest";

import { MidiEventEngine, MidiParseError, type Song } from "../src/midi-event-engine.js";

describe("MidiEventEngine unit", () => {
  it("throws MidiParseError for non-binary Song payload", () => {
    const engine = new MidiEventEngine();
    const invalidSong: Song = {
      get(): string {
        return "bad-\u{1F4A5}";
      },
    };

    expect(() => engine.play(invalidSong)).toThrowError(MidiParseError);
    expect(() => engine.play(invalidSong)).toThrowError(
      "Song returned a non-binary string. Each character code must be in range 0..255.",
    );
  });
});
