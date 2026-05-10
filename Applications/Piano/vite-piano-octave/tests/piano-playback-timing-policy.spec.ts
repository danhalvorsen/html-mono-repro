import { describe, expect, it } from "vitest";
import { PianoPlaybackTimingPolicy } from "../src/application/playback/PianoPlaybackTimingPolicy";
import type { ProjectedSongStep } from "../src/application/projection/MidiSongProjector";

describe("PianoPlaybackTimingPolicy", () => {
  it("should clamp playback speed and midi signal rate", () => {
    const policy = new PianoPlaybackTimingPolicy();

    expect(policy.getSafePlaybackSpeed(0)).toBe(0.001);
    expect(policy.getSafePlaybackSpeed(2)).toBe(1);
    expect(policy.getSafeMidiSignalRate(0)).toBe(0.05);
    expect(policy.getSafeMidiSignalRate(10)).toBe(4);
  });

  it("should normalize projected duration to requested target", () => {
    const policy = new PianoPlaybackTimingPolicy();

    const source: readonly ProjectedSongStep[] = [
      { octaveIndex: 0, note: "C", startMs: 0, holdMs: 200 },
      { octaveIndex: 0, note: "E", startMs: 600, holdMs: 300 }
    ];

    const normalized = policy.normalizeProjectedDuration(source, 1800);
    const lastStep = normalized[1];

    expect(lastStep.startMs + lastStep.holdMs).toBe(1800);
  });
});

