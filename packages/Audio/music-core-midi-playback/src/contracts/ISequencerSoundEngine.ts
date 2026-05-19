import type { IMidiPlayer } from "./IMidiPlayer.js";

export interface ISequencerSoundEngine extends IMidiPlayer {
  getCurrentTimeSeconds(): number;
  allNotesOff(channel?: number): void;
  allSoundOff(channel?: number): void;
  panic(): void;
}
