import type { IPianoOctavePlayback } from "./IPianoOctavePlayback";

export interface IPianoRootPlaybackService {
  playSong(_octaves: readonly IPianoOctavePlayback[]): void;
}
