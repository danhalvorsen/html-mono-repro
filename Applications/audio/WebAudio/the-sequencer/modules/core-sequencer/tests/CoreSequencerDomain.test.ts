import { describe, expect, it } from "vitest";
import {
  Pattern,
  Sequencer,
  SequencerDefinition,
  SequencerMode,
  Track,
  TrackStep,
  TrackType,
} from "../src/index.js";
import { DomainError } from "../src/infrastructure/DomainError.js";
import { ErrorCode } from "../src/infrastructure/ErrorCode.js";

class CoreSequencerFixture {
  public static createTrack(
    id: string,
    sequenceLength = 4,
  ): Track<number> {
    return new Track<number>(id, `${id}-name`, TrackType.Trigger, sequenceLength);
  }

  public static createPattern(
    id: string,
    tracks: readonly Track<number>[],
  ): Pattern<number> {
    return new Pattern<number>(id, `${id}-pattern`, tracks, SequencerMode.Multitrack);
  }

  public static createDefinition(
    patterns: readonly Pattern<number>[],
  ): SequencerDefinition<number> {
    return new SequencerDefinition<number>(
      "definition",
      SequencerMode.Multitrack,
      patterns,
    );
  }
}

describe("core-sequencer domain", () => {
  it("should reject setting a value on an inactive track step", () => {
    const step = new TrackStep<number>(0);

    let capturedError: DomainError | undefined;

    try {
      step.setValue(42);
    } catch (error) {
      capturedError = error as DomainError;
    }

    expect(capturedError).toBeInstanceOf(DomainError);
    expect(capturedError?.code.equals(ErrorCode.InvalidState)).toBe(true);
    expect(capturedError?.detail).toBe("Cannot set value on an inactive step.");
  });

  it("should compare sequencer definitions by pattern content instead of array reference", () => {
    const leftTrack = CoreSequencerFixture.createTrack("track-1");
    leftTrack.activateStep(0, 1);
    const rightTrack = CoreSequencerFixture.createTrack("track-1");
    rightTrack.activateStep(1, 1);

    const left = CoreSequencerFixture.createDefinition([
      CoreSequencerFixture.createPattern("pattern-1", [leftTrack]),
    ]);
    const right = CoreSequencerFixture.createDefinition([
      CoreSequencerFixture.createPattern("pattern-1", [rightTrack]),
    ]);

    expect(left.equals(right)).toBe(false);
  });

  it("should replace a pattern track immutably", () => {
    const originalTrack = CoreSequencerFixture.createTrack("track-1");
    const replacementTrack = CoreSequencerFixture.createTrack("track-2");
    const pattern = CoreSequencerFixture.createPattern("pattern-1", [originalTrack]);

    const replaced = pattern.withReplacedTrack(
      0,
      replacementTrack,
      SequencerMode.Multitrack,
    );

    expect(pattern.getTrack(0).id).toBe("track-1");
    expect(replaced.getTrack(0).id).toBe("track-2");
  });

  it("should reject selecting a sequencer pattern outside the valid range", () => {
    const sequencer = new Sequencer<number>(
      "sequencer-1",
      CoreSequencerFixture.createDefinition([
        CoreSequencerFixture.createPattern("pattern-1", [CoreSequencerFixture.createTrack("track-1")]),
      ]),
    );

    expect(() => sequencer.selectPattern(1)).toThrowError(DomainError);
  });

  it("should reject unsupported track type creation", () => {
    expect(() => TrackType.create("unsupported")).toThrowError(DomainError);
  });
});