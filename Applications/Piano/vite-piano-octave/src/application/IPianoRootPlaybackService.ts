import type { IPianoOctavePlayback } from "./IPianoOctavePlayback";

export interface IPianoRootPlaybackService {
  playDemoChords(
    octaves: readonly IPianoOctavePlayback[],
    maxSimultaneousOctaves: number,
    playbackSpeed: number
  ): void;

  playGriegConcertoTheme(
    octaves: readonly IPianoOctavePlayback[],
    maxSimultaneousOctaves: number,
    playbackSpeed: number,
    midiSignalRate: number
  ): void;

  playMidiSongFromUrl(
    octaves: readonly IPianoOctavePlayback[],
    url: string,
    playbackSpeed: number,
    midiSignalRate: number,
    targetDurationMs?: number
  ): Promise<void>;
}

