import type { IMidiStreamSink } from "@monorepo/audio-function-midi-streamer-contracts";

export interface IWebAudioMidiStreamSinkFactory {
  create(request: IWebAudioMidiStreamSinkFactoryRequest): IMidiStreamSink;
}

export interface IWebAudioMidiStreamSinkFactoryRequest {
  readonly context: AudioContext;
  readonly output: AudioNode;
}
