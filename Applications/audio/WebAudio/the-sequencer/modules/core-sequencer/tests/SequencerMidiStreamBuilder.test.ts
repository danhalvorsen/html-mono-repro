import { describe, expect, it } from "vitest";
import {
  SequencerMidiStreamBuilder,
  type ISequencerTrackPlaybackProjection,
} from "../src/index.js";

class SequencerTrackPlaybackProjectionFixture {
  public static create(
    trackId: number,
    stepStates: readonly boolean[],
    selected = true,
  ): ISequencerTrackPlaybackProjection {
    return Object.freeze({
      trackId,
      selected,
      stepStates: [...stepStates],
    });
  }
}

describe("SequencerMidiStreamBuilder", () => {
  it("should build a playback frame from selected track projections", () => {
    const builder = new SequencerMidiStreamBuilder({ initialBpm: 120 });

    const frame = builder.buildPlaybackFrame([
      SequencerTrackPlaybackProjectionFixture.create(0, [true, false, true, false]),
      SequencerTrackPlaybackProjectionFixture.create(1, [false, true, false, false]),
    ]);

    expect(frame.steps).toEqual([
      {
        stepIndex: 0,
        holdMs: 500,
        notes: [36],
        noteEvents: [{ trackId: 0, note: 36, voice: { noteLengthSeconds: 0.028, sustain: 0, filterFrequency: 1350, filterQ: 0.7 } }],
      },
      {
        stepIndex: 1,
        holdMs: 500,
        notes: [38],
        noteEvents: [{ trackId: 1, note: 38, voice: { noteLengthSeconds: 0.034, sustain: 0, filterFrequency: 1800, filterQ: 0.8 } }],
      },
      {
        stepIndex: 2,
        holdMs: 500,
        notes: [36],
        noteEvents: [{ trackId: 0, note: 36, voice: { noteLengthSeconds: 0.028, sustain: 0, filterFrequency: 1350, filterQ: 0.7 } }],
      },
      { stepIndex: 3, holdMs: 500, notes: [], noteEvents: [] },
    ]);
  });

  it("should exclude disabled tracks from the playback frame", () => {
    const builder = new SequencerMidiStreamBuilder({ initialBpm: 120 });

    const frame = builder.buildPlaybackFrame([
      SequencerTrackPlaybackProjectionFixture.create(0, [true, false], false),
      SequencerTrackPlaybackProjectionFixture.create(1, [false, true]),
    ]);

    expect(frame.steps).toEqual([
      { stepIndex: 0, holdMs: 1000, notes: [], noteEvents: [] },
      {
        stepIndex: 1,
        holdMs: 1000,
        notes: [38],
        noteEvents: [{ trackId: 1, note: 38, voice: { noteLengthSeconds: 0.034, sustain: 0, filterFrequency: 1800, filterQ: 0.8 } }],
      },
    ]);
  });

  it("should build a midi stream with rests and note tokens", () => {
    const builder = new SequencerMidiStreamBuilder({ initialBpm: 120 });

    const midiStream = builder.buildStream([
      SequencerTrackPlaybackProjectionFixture.create(0, [true, false, false, false]),
      SequencerTrackPlaybackProjectionFixture.create(1, [false, false, true, false]),
    ]);

    expect(midiStream).toBe(
      "N36-h500-v112-ch1 R-h500 N38-h500-v112-ch1 R-h500",
    );
  });

  it("should use the configured default step count when projections are empty", () => {
    const builder = new SequencerMidiStreamBuilder({
      initialBpm: 120,
      defaultStepCount: 8,
    });

    const frame = builder.buildPlaybackFrame([]);

    expect(frame.steps).toHaveLength(8);
    expect(frame.steps.every((step) => step.notes.length === 0)).toBe(true);
    expect(frame.steps.every((step) => step.holdMs === 250)).toBe(true);
  });

  it("should update bpm and use injected note mappings for upcoming projects", () => {
    const builder = new SequencerMidiStreamBuilder({
      initialBpm: 90,
      noteNumbersByTrackId: [60, 64, 67],
    });

    builder.setBpm(150);

    const midiStream = builder.buildStream([
      SequencerTrackPlaybackProjectionFixture.create(2, [true, false, false, false]),
    ]);

    expect(builder.bpm).toBe(150);
    expect(midiStream).toBe(
      "N67-h400-v112-ch1 R-h400 R-h400 R-h400",
    );
  });
});
