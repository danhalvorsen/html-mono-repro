import { DomainContext } from "./infrastructure/DomainContext.js";
import { DomainError } from "./infrastructure/DomainError.js";
import { Entity } from "./infrastructure/Entity.js";
import { ErrorCode } from "./infrastructure/ErrorCode.js";
import { Guard } from "./infrastructure/Guard.js";
import type { ITrackSnapshot, Track } from "./track/track.js";
import type { SequencerMode } from "./SequencerMode.js";

export interface IPatternSnapshot<TValue> {
  readonly id: string;
  readonly name: string;
  readonly trackCount: number;
  readonly tracks: readonly ITrackSnapshot<TValue>[];
}

export class Pattern<TValue> extends Entity {
  private readonly _name: string;
  private readonly _tracks: readonly Track<TValue>[];

  public constructor(
    id: string,
    name: string,
    tracks: readonly Track<TValue>[],
    mode: SequencerMode,
  ) {
    super(id);

    this._name = Guard.notBlank(name, DomainContext.PatternName);
    const normalizedTracks = Guard.notNull(tracks, DomainContext.PatternTracks);
    const normalizedMode = Guard.notNull(mode, DomainContext.PatternSequencerMode);

    if (normalizedTracks.length === 0) {
      throw new DomainError(
        ErrorCode.Required,
        DomainContext.PatternTracks,
        "Pattern must contain at least one track.",
      );
    }

    if (normalizedTracks.length > normalizedMode.maxTrackCount) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.PatternTracks,
        `Pattern track count cannot exceed mode limit of ${normalizedMode.maxTrackCount}.`,
      );
    }

    this._tracks = Object.freeze([...normalizedTracks]);
  }

  public get name(): string {
    return this._name;
  }

  public get trackCount(): number {
    return this._tracks.length;
  }

  public getTracks(): readonly Track<TValue>[] {
    return this._tracks;
  }

  public getTrack(index: number): Track<TValue> {
    const normalizedIndex = Guard.nonNegative(
      Guard.integer(index, DomainContext.PatternTrackIndex),
      DomainContext.PatternTrackIndex,
    );

    const track = this._tracks[normalizedIndex];
    if (track === undefined) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.PatternTrackIndex,
        "Pattern track index is outside the pattern track range.",
      );
    }

    return track;
  }

  public withReplacedTrack(
    index: number,
    track: Track<TValue>,
    mode: SequencerMode,
  ): Pattern<TValue> {
    const normalizedIndex = Guard.nonNegative(
      Guard.integer(index, DomainContext.PatternTrackIndex),
      DomainContext.PatternTrackIndex,
    );
    const normalizedTrack = Guard.notNull(track, DomainContext.PatternTracks);
    const normalizedMode = Guard.notNull(mode, DomainContext.PatternSequencerMode);

    if (this._tracks[normalizedIndex] === undefined) {
      throw new DomainError(
        ErrorCode.OutOfRange,
        DomainContext.PatternTrackIndex,
        "Pattern track index is outside the pattern track range.",
      );
    }

    const nextTracks = [...this._tracks];
    nextTracks[normalizedIndex] = normalizedTrack;

    return new Pattern<TValue>(this.id, this._name, nextTracks, normalizedMode);
  }

  public toSnapshot(): IPatternSnapshot<TValue> {
    return Object.freeze({
      id: this.id,
      name: this._name,
      trackCount: this._tracks.length,
      tracks: Object.freeze(this._tracks.map((track) => track.toSnapshot())),
    });
  }
}