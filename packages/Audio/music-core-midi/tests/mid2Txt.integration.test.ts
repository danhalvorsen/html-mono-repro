import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { midiToText, SimpleMidiTextFormatter } from "../src/mid2Txt.js";

describe("midiToText integration", () => {
  it("reads a real .mid file fixture and converts it to deterministic text", () => {
    const fixtureUrl = new URL("./1999 JD_midicities_dot_com.mid", import.meta.url);
    const bytes = new Uint8Array(readFileSync(fixtureUrl));

    const formatter = new SimpleMidiTextFormatter();
    const text = midiToText(bytes, formatter);

    expect(text).toContain("MIDI format=1 tracks=14 division=tpqn=96");
    expect(text).toContain("Track 0:");
    expect(text).toContain("META Tempo");
    expect(text).toContain('META trackName "Drum (MIDI)"');
  });
});
