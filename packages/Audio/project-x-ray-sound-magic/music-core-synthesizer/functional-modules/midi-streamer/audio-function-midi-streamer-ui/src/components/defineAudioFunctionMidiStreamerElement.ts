import { AudioFunctionMidiStreamerElement } from "./AudioFunctionMidiStreamerElement.js";

export const AudioFunctionMidiStreamerElementTagName =
  "audio-function-midi-streamer";

export function defineAudioFunctionMidiStreamerElement(
  registry: CustomElementRegistry = customElements,
): void {
  if (registry.get(AudioFunctionMidiStreamerElementTagName) !== undefined) {
    return;
  }

  registry.define(
    AudioFunctionMidiStreamerElementTagName,
    AudioFunctionMidiStreamerElement,
  );
}