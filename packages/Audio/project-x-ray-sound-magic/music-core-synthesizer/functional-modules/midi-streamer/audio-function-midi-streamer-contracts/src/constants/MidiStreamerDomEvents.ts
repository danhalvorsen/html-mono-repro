export const MidiStreamerDomEvents = {
  songsLoaded: "audio-function-midi-streamer:songs-loaded",
  songSelected: "audio-function-midi-streamer:song-selected",
  midiMessage: "audio-function-midi-streamer:midi-message",
  streamCompleted: "audio-function-midi-streamer:stream-completed",
  streamFailed: "audio-function-midi-streamer:stream-failed",
} as const;

export type MidiStreamerDomEventName =
  (typeof MidiStreamerDomEvents)[keyof typeof MidiStreamerDomEvents];
