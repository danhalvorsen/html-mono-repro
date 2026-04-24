import type { ISequencerPlaybackFrame } from "./ISequencerPlaybackFrame.js";
import type { ISequencerTrackPlaybackProjection } from "./ISequencerTrackPlaybackProjection.js";

export interface ISequencerMidiStreamBuilderDependencies {
  readonly initialBpm?: number;
  readonly noteNumbersByTrackId?: readonly number[];
  readonly beatsPerBar?: number;
  readonly defaultStepCount?: number;
  readonly velocity?: number;
  readonly midiChannel?: number;
}

export class SequencerMidiStreamBuilder {
  private static readonly DefaultNoteNumbersByTrackId = Object.freeze([
    36,
    38,
    42,
    46,
    49,
    51,
    45,
    47,
  ]);
  private static readonly DefaultBpm = 130;
  private static readonly DefaultBeatsPerBar = 4;
  private static readonly DefaultStepCount = 16;
  private static readonly DefaultVelocity = 112;
  private static readonly DefaultMidiChannel = 1;

  private readonly noteNumbersByTrackId: readonly number[];
  private readonly beatsPerBar: number;
  private readonly defaultStepCount: number;
  private readonly velocity: number;
  private readonly midiChannel: number;
  private bpmValue: number;

  public constructor(
    dependencies: ISequencerMidiStreamBuilderDependencies = {},
  ) {
    this.noteNumbersByTrackId =
      dependencies.noteNumbersByTrackId !== undefined &&
      dependencies.noteNumbersByTrackId.length > 0
        ? Object.freeze([...dependencies.noteNumbersByTrackId])
        : SequencerMidiStreamBuilder.DefaultNoteNumbersByTrackId;
    this.beatsPerBar = SequencerMidiStreamBuilder.normalizePositiveInteger(
      dependencies.beatsPerBar,
      SequencerMidiStreamBuilder.DefaultBeatsPerBar,
    );
    this.defaultStepCount = SequencerMidiStreamBuilder.normalizePositiveInteger(
      dependencies.defaultStepCount,
      SequencerMidiStreamBuilder.DefaultStepCount,
    );
    this.velocity = SequencerMidiStreamBuilder.normalizePositiveInteger(
      dependencies.velocity,
      SequencerMidiStreamBuilder.DefaultVelocity,
    );
    this.midiChannel = SequencerMidiStreamBuilder.normalizePositiveInteger(
      dependencies.midiChannel,
      SequencerMidiStreamBuilder.DefaultMidiChannel,
    );
    this.bpmValue = SequencerMidiStreamBuilder.normalizePositiveInteger(
      dependencies.initialBpm,
      SequencerMidiStreamBuilder.DefaultBpm,
    );
  }

  public get bpm(): number {
    return this.bpmValue;
  }

  public setBpm(value: number): void {
    this.bpmValue = SequencerMidiStreamBuilder.normalizePositiveInteger(
      value,
      this.bpmValue,
    );
  }

  public buildStream(
    projections: readonly ISequencerTrackPlaybackProjection[],
    configuredStepCount?: number,
  ): string {
    const frame = this.buildPlaybackFrame(projections, configuredStepCount);
    const tokens: string[] = [];

    for (const step of frame.steps) {
      if (step.notes.length === 0) {
        tokens.push(`R-h${step.holdMs}`);
        continue;
      }

      for (const note of step.notes) {
        tokens.push(
          `N${note}-h${step.holdMs}-v${this.velocity}-ch${this.midiChannel}`,
        );
      }
    }

    return tokens.join(" ");
  }

  public buildPlaybackFrame(
    projections: readonly ISequencerTrackPlaybackProjection[],
    configuredStepCount?: number,
  ): ISequencerPlaybackFrame {
    const stepCount = this.resolveStepCount(projections, configuredStepCount);
    const holdMs = this.resolveHoldMs(stepCount);

    const steps = Array.from({ length: stepCount }, (_, stepIndex) => {
      const notes = projections
        .filter(
          (track) => track.selected && track.stepStates[stepIndex] === true,
        )
        .map((track) => this.resolveNote(track.trackId));

      return Object.freeze({
        stepIndex,
        holdMs,
        notes: Object.freeze(notes),
      });
    });

    return Object.freeze({
      steps: Object.freeze(steps),
    });
  }

  private resolveStepCount(
    projections: readonly ISequencerTrackPlaybackProjection[],
    configuredStepCount?: number,
  ): number {
    const normalizedConfiguredStepCount =
      SequencerMidiStreamBuilder.tryNormalizePositiveInteger(configuredStepCount);

    if (normalizedConfiguredStepCount !== undefined) {
      return normalizedConfiguredStepCount;
    }

    const firstTrack = projections[0];
    if (firstTrack) {
      return firstTrack.stepStates.length;
    }

    return this.defaultStepCount;
  }

  private resolveNote(trackId: number): number {
    const normalizedIndex = Math.abs(Math.floor(trackId));
    const resolved =
      this.noteNumbersByTrackId[
        normalizedIndex % this.noteNumbersByTrackId.length
      ];

    return resolved ?? this.noteNumbersByTrackId[0] ?? 36;
  }

  private resolveHoldMs(stepCount: number): number {
    const beatMs = 60000 / this.bpmValue;
    const stepMs = (beatMs * this.beatsPerBar) / stepCount;
    return Math.max(30, Math.round(stepMs));
  }

  private static normalizePositiveInteger(
    value: number | undefined,
    fallback: number,
  ): number {
    const normalized = SequencerMidiStreamBuilder.tryNormalizePositiveInteger(
      value,
    );
    return normalized ?? fallback;
  }

  private static tryNormalizePositiveInteger(
    value: number | undefined,
  ): number | undefined {
    if (value === undefined || !Number.isFinite(value)) {
      return undefined;
    }

    const normalized = Math.floor(value);
    if (normalized <= 0) {
      return undefined;
    }

    return normalized;
  }
}