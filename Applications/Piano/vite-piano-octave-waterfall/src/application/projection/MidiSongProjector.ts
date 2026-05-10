export type ProjectedSongStep = {
  readonly note: string;
  readonly octaveIndex: number;
  readonly holdMs: number;
};

export class MidiSongProjector {
  public project(): readonly ProjectedSongStep[] {
    return [];
  }
}
