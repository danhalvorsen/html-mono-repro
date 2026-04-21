// NEW: Pattern.ts
import { Entity } from "./infrastructure/Entity.js";
import { Guard } from "./infrastructure/Guard.js";
import type { Track } from "./track/track.js";
import type { SequencerMode } from "./SequencerMode.js";

export class Pattern<TValue> extends Entity {
  private readonly _name: string;
  private readonly _tracks: Track<TValue>[];

  public constructor(
    id: string,
    name: string,
    tracks: readonly Track<TValue>[],
    mode: SequencerMode
  ) {
    super(id);

    Guard.notBlank(name, "Pattern name");
    Guard.notNull(tracks, "Pattern tracks");
    Guard.notNull(mode, "Pattern sequencer mode");

    if (tracks.length === 0) {
      throw new Error("Pattern must contain at least one track.");
    }

    if (tracks.length > mode.maxTrackCount) {
      throw new Error(
        `Pattern track count cannot exceed mode limit of ${mode.maxTrackCount}.`
      );
    }

    this._name = name;
    this._tracks = [...tracks];
  }

  public get name(): string {
    return this._name;
  }

  public get trackCount(): number {
    return this._tracks.length;
  }

  public getTracks(): readonly Track<TValue>[] {
    return [...this._tracks];
  }

  public getTrack(index: number): Track<TValue> {
    Guard.integer(index, "Pattern track index");
    Guard.nonNegative(index, "Pattern track index");

    if (index >= this._tracks.length) {
      throw new Error("Pattern track index is outside the pattern track range.");
    }

    return this._tracks[index];
  }

  public replaceTrack(index: number, track: Track<TValue>): void {
    Guard.integer(index, "Pattern track index");
    Guard.nonNegative(index, "Pattern track index");
    Guard.notNull(track, "Pattern track");

    if (index >= this._tracks.length) {
      throw new Error("Pattern track index is outside the pattern track range.");
    }

    this._tracks[index] = track;
  }
}