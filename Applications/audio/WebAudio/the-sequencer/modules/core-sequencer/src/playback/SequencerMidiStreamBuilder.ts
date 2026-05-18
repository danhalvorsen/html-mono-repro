import type { ISequencerPlaybackFrame } from "./ISequencerPlaybackFrame.js";
import type { ISequencerTrackPlaybackProjection } from "./ISequencerTrackPlaybackProjection.js";
import type {
  ISequencerPlaybackNoteEvent,
  ISequencerVoiceParameters,
} from "./ISequencerPlaybackStep.js";

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
  private static readonly DefaultVoiceByTrackId = Object.freeze([
    Object.freeze({ noteLengthSeconds: 0.028, sustain: 0, filterFrequency: 1350, filterQ: 0.7 }),
    Object.freeze({ noteLengthSeconds: 0.034, sustain: 0, filterFrequency: 1800, filterQ: 0.8 }),
    Object.freeze({ noteLengthSeconds: 0.018, sustain: 0, filterFrequency: 4200, filterQ: 0.9 }),
    Object.freeze({ noteLengthSeconds: 0.02, sustain: 0, filterFrequency: 5200, filterQ: 0.8 }),
    Object.freeze({ noteLengthSeconds: 0.024, sustain: 0, filterFrequency: 2500, filterQ: 1.1 }),
    Object.freeze({ noteLengthSeconds: 0.03, sustain: 0, filterFrequency: 1600, filterQ: 1.2 }),
    Object.freeze({ noteLengthSeconds: 0.022, sustain: 0, filterFrequency: 2800, filterQ: 1.4 }),
    Object.freeze({ noteLengthSeconds: 0.016, sustain: 0, filterFrequency: 6000, filterQ: 0.6 }),
  ] as const);

  private readonly noteNumbersByTrackId: readonly number[];
  private readonly beatsPerBar: number;
  private readonly defaultStepCount: number;
  private readonly velocity: number;
  private readonly midiChannel: number;
  private readonly voiceByTrackId: readonly ISequencerVoiceParameters[];
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
    this.voiceByTrackId = SequencerMidiStreamBuilder.DefaultVoiceByTrackId;
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
      const noteEvents = projections
        .filter(
          (track) => track.selected && track.stepStates[stepIndex] === true,
        )
        .map((track) =>
          Object.freeze({
            trackId: track.trackId,
            note: this.resolveNote(track.trackId),
            voice: this.resolveVoice(track.trackId),
          } satisfies ISequencerPlaybackNoteEvent),
        );
      const notes = noteEvents.map((event) => event.note);

      return Object.freeze({
        stepIndex,
        holdMs,
        notes: Object.freeze(notes),
        noteEvents: Object.freeze(noteEvents),
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

  private resolveVoice(trackId: number): ISequencerVoiceParameters {
    const normalizedIndex = Math.abs(Math.floor(trackId));
    return (
      this.voiceByTrackId[normalizedIndex % this.voiceByTrackId.length] ??
      this.voiceByTrackId[0] ??
      Object.freeze({ sustain: 0 })
    );
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
