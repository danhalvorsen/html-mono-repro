import { describe, expect, it } from "vitest";
import {
  SequencerPlaybackProjectionMidiStreamProvider,
  type ISequencerPlaybackProjectionSource,
  type ISequencerTrackPlaybackProjection,
} from "../src/index.js";

class MutableSequencerPlaybackProjectionSource
  implements ISequencerPlaybackProjectionSource
{
  public stepCount: number | undefined;
  private projections: readonly ISequencerTrackPlaybackProjection[];

  public constructor(
    projections: readonly ISequencerTrackPlaybackProjection[],
    stepCount?: number,
  ) {
    this.projections = projections;
    this.stepCount = stepCount;
  }

  public getTrackProjections(): readonly ISequencerTrackPlaybackProjection[] {
    return this.projections;
  }

  public setProjections(
    projections: readonly ISequencerTrackPlaybackProjection[],
  ): void {
    this.projections = projections;
  }
}

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

describe("SequencerPlaybackProjectionMidiStreamProvider", () => {
  it("should expose a playback frame for the current projection source", () => {
    const source = new MutableSequencerPlaybackProjectionSource(
      [
        SequencerTrackPlaybackProjectionFixture.create(0, [true, false, false, false]),
        SequencerTrackPlaybackProjectionFixture.create(1, [false, true, false, false]),
      ],
      4,
    );
    const provider = new SequencerPlaybackProjectionMidiStreamProvider(source, {
      initialBpm: 120,
    });

    expect(provider.getPlaybackFrame().steps).toEqual([
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
      { stepIndex: 2, holdMs: 500, notes: [], noteEvents: [] },
      { stepIndex: 3, holdMs: 500, notes: [], noteEvents: [] },
    ]);
  });

  it("should build a midi stream from the current projection source", () => {
    const source = new MutableSequencerPlaybackProjectionSource(
      [
        SequencerTrackPlaybackProjectionFixture.create(0, [true, false, false, false]),
        SequencerTrackPlaybackProjectionFixture.create(1, [false, false, true, false]),
      ],
      4,
    );
    const provider = new SequencerPlaybackProjectionMidiStreamProvider(source, {
      initialBpm: 120,
    });

    expect(provider.buildStream()).toBe(
      "N36-h500-v112-ch1 R-h500 N38-h500-v112-ch1 R-h500",
    );
  });

  it("should update bpm and reflect source changes without recreating the provider", () => {
    const source = new MutableSequencerPlaybackProjectionSource(
      [
        SequencerTrackPlaybackProjectionFixture.create(0, [true, false, false, false]),
      ],
      4,
    );
    const provider = new SequencerPlaybackProjectionMidiStreamProvider(source, {
      initialBpm: 120,
      noteNumbersByTrackId: [60, 64],
    });

    provider.setBpm(150);
    source.setProjections([
      SequencerTrackPlaybackProjectionFixture.create(1, [false, true, false, false]),
    ]);

    expect(provider.bpm).toBe(150);
    expect(provider.buildStream()).toBe(
      "R-h400 N64-h400-v112-ch1 R-h400 R-h400",
    );
  });
});
