import type { MidiMessage } from "@monorepo/music-core-midi";
import type { MidiPlaybackOptions } from "./MidiPlaybackOptions.js";

export interface IMidiPlayer {
  play(message: MidiMessage, options?: MidiPlaybackOptions): void;
}
