import type { ProjectedSongStep } from "./MidiSongProjector";

export interface IMidiSongProjector {
  projectFromUrl(url: string): Promise<readonly ProjectedSongStep[]>;
}

