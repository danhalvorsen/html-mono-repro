// FILE: packages/Audio/music-core-midi/test/mid2Txt.spec.ts

import { describe, it, expect } from "vitest";
import { midiToText, SimpleMidiTextFormatter } from "../src/mid2Txt";

function buildMinimalFormat0SingleNote(): Uint8Array {
  // MThd, length=6, format=0, tracks=1, division=96
  const header = [
    0x4d, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x00,
    0x00, 0x01,
    0x00, 0x60,
  ];

  // MTrk, length placeholder
  const events: number[] = [];
  // delta=0, meta track name "T"
  events.push(0x00, 0xff, 0x03, 0x01, 0x54);
  // delta=0, program change ch0 prog0
  events.push(0x00, 0xc0, 0x00);
  // delta=0, note on C4 vel 64
  events.push(0x00, 0x90, 60, 64);
  // delta=96, note off C4 vel 64
  events.push(0x60, 0x80, 60, 64);
  // delta=0, end of track
  events.push(0x00, 0xff, 0x2f, 0x00);

  const trackLength = events.length;
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b,
    (trackLength >>> 24) & 0xff,
    (trackLength >>> 16) & 0xff,
    (trackLength >>> 8) & 0xff,
    trackLength & 0xff,
  ];

  return new Uint8Array([...header, ...trackHeader, ...events]);
}

describe("midiToText", () => {
  it("should parse a minimal format 0 file and produce deterministic text", () => {
    const data = buildMinimalFormat0SingleNote();
    const formatter = new SimpleMidiTextFormatter();

    const text = midiToText(data, formatter);
    const lines = text.split("\n");

    expect(lines[0]).toContain("MIDI format=0");
    expect(lines[0]).toContain("tracks=1");
    expect(lines[1]).toBe("");
    expect(lines[2]).toBe("Track 0:");
    expect(lines.some(l => l.includes("NoteOn ch=1 note=60"))).toBe(true);
    expect(lines.some(l => l.includes("NoteOff ch=1 note=60"))).toBe(true);
  });

  it("should throw on invalid header id", () => {
    const data = buildMinimalFormat0SingleNote().slice();
    data[0] = 0x00; // corrupt 'M'
    const formatter = new SimpleMidiTextFormatter();

    expect(() => midiToText(data, formatter)).toThrow(/missing MThd/i);
  });

  it("should throw on truncated file", () => {
    const full = buildMinimalFormat0SingleNote();
    const truncated = full.subarray(0, full.length - 2);
    const formatter = new SimpleMidiTextFormatter();

    expect(() => midiToText(truncated, formatter)).toThrow(/Unexpected EOF/i);
  });
});
