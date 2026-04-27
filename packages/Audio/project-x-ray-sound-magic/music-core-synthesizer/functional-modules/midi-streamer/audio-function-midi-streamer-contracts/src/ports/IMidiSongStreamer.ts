import type { MidiSong } from "../model/MidiSong.js";
import type { IMidiStreamSink } from "./IMidiStreamSink.js";
import type { MidiStreamSubscription } from "./IMidiStreamScheduler.js";

export interface IMidiSongStreamer {
  stream(song: MidiSong, sink: IMidiStreamSink): MidiStreamSubscription;
}
