import { DomainContext } from "./infrastructure/DomainContext.js";
import { DomainError } from "./infrastructure/DomainError.js";
import { ErrorCode } from "./infrastructure/ErrorCode.js";
import { Guard } from "./infrastructure/Guard.js";
import { ValueObject } from "./infrastructure/ValueObject.js";
import type { IPatternSnapshot, Pattern } from "./pattern.js";
import { Sequencer } from "./sequencer.js";
import type { SequencerMode } from "./SequencerMode.js";
import type { ITrackStepSnapshot } from "./track/TrackStep.js";
import type { ITrackSnapshot } from "./track/track.js";

export class SequencerDefinition<TValue> extends ValueObject {
  private readonly _name: string;
  private readonly _mode: SequencerMode;
  private readonly _patterns: readonly Pattern<TValue>[];

  public constructor(
    name: string,
    mode: SequencerMode,
    patterns: readonly Pattern<TValue>[],
  ) {
    super();

    this._name = Guard.notBlank(name, DomainContext.SequencerDefinitionName);
    this._mode = Guard.notNull(mode, DomainContext.SequencerDefinitionMode);
    const normalizedPatterns = Guard.notNull(
      patterns,
      DomainContext.SequencerDefinitionPatterns,
    );

    if (normalizedPatterns.length === 0) {
      throw new DomainError(
        ErrorCode.Required,
        DomainContext.SequencerDefinitionPatterns,
        "SequencerDefinition.Patterns must contain at least one pattern.",
      );
    }

    if (normalizedPatterns.length > Sequencer.MaxPatternCount) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.SequencerDefinitionPatterns,
        `SequencerDefinition.Patterns cannot exceed ${Sequencer.MaxPatternCount}.`,
      );
    }

    this._patterns = Object.freeze([...normalizedPatterns]);
  }

  public get name(): string {
    return this._name;
  }

  public get mode(): SequencerMode {
    return this._mode;
  }

  public get patterns(): readonly Pattern<TValue>[] {
    return this._patterns;
  }

  public override equals(other: ValueObject): boolean {
    if (!(other instanceof SequencerDefinition)) {
      return false;
    }

    if (other._name !== this._name) {
      return false;
    }

    if (!other._mode.equals(this._mode)) {
      return false;
    }

    if (other._patterns.length !== this._patterns.length) {
      return false;
    }

    for (let index = 0; index < this._patterns.length; index += 1) {
      const left = this._patterns[index];
      const right = other._patterns[index];

      if (left === undefined || right === undefined) {
        return false;
      }

      if (
        !SequencerDefinition.arePatternsEqual(left.toSnapshot(), right.toSnapshot())
      ) {
        return false;
      }
    }

    return true;
  }

  private static arePatternsEqual<TValue>(
    left: IPatternSnapshot<TValue>,
    right: IPatternSnapshot<TValue>,
  ): boolean {
    if (
      left.id !== right.id ||
      left.name !== right.name ||
      left.trackCount !== right.trackCount ||
      left.tracks.length !== right.tracks.length
    ) {
      return false;
    }

    for (let index = 0; index < left.tracks.length; index += 1) {
      const leftTrack = left.tracks[index];
      const rightTrack = right.tracks[index];

      if (leftTrack === undefined || rightTrack === undefined) {
        return false;
      }

      if (!SequencerDefinition.areTracksEqual(leftTrack, rightTrack)) {
        return false;
      }
    }

    return true;
  }

  private static areTracksEqual<TValue>(
    left: ITrackSnapshot<TValue>,
    right: ITrackSnapshot<TValue>,
  ): boolean {
    if (
      left.id !== right.id ||
      left.name !== right.name ||
      left.type !== right.type ||
      left.capacity !== right.capacity ||
      left.sequenceLength !== right.sequenceLength ||
      left.steps.length !== right.steps.length
    ) {
      return false;
    }

    for (let index = 0; index < left.steps.length; index += 1) {
      const leftStep = left.steps[index];
      const rightStep = right.steps[index];

      if (leftStep === undefined || rightStep === undefined) {
        return false;
      }

      if (!SequencerDefinition.areStepsEqual(leftStep, rightStep)) {
        return false;
      }
    }

    return true;
  }

  private static areStepsEqual<TValue>(
    left: ITrackStepSnapshot<TValue>,
    right: ITrackStepSnapshot<TValue>,
  ): boolean {
    return (
      left.index === right.index &&
      left.isActive === right.isActive &&
      left.value === right.value
    );
  }
}