import {
  DrumVoicePreset,
  WebAudioMidiPlayer,
  type IMidiPlayer,
} from "@monorepo/music-core-midi-playback";

export class SequencerMidiPlaybackPlayerFactory {
  public static createDefault(): IMidiPlayer {
    return new WebAudioMidiPlayer({
      ...DrumVoicePreset,
    });
  }
}
