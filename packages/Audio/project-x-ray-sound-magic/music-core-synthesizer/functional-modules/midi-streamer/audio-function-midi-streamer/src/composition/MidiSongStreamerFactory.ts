import { MidiSongStreamer } from "../application/MidiSongStreamer.js";
import { MidiSongValidator } from "../domain/MidiSongValidator.js";
import { TimeoutMidiStreamScheduler } from "../infrastructure/TimeoutMidiStreamScheduler.js";

export class MidiSongStreamerFactory {
  public createDefault(): MidiSongStreamer {
    return this.createBrowserDefault();
  }

  public createBrowserDefault(): MidiSongStreamer {
    return new MidiSongStreamer(
      new TimeoutMidiStreamScheduler(),
      new MidiSongValidator(),
    );
  }
}
