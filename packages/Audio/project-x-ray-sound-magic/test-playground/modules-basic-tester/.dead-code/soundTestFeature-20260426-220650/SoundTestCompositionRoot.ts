// FILE: src/features/soundTestFeature/SoundTestCompositionRoot.ts

import {
  WebAudioEnvelopeGainGraphFactory,
  type IWebAudioContextLike as IEnvelopeWebAudioContextLike,
} from "@monorepo/music-core-synthesizer-envelopes-web-audio";
import {
  WebAudioOscillatorGraphFactory,
  type IWebAudioContextLike as IOscillatorWebAudioContextLike,
} from "@monorepo/music-core-synthesizer-oscillators-web-audio";

import {
  type ITwoOscillatorVoiceFactory,
  TwoOscillatorVoiceDefinitionValidator,
  TwoOscillatorVoiceFactory,
} from "./TwoOscillatorVoice.js";

export class SoundTestCompositionRoot {
  public constructor(private readonly context: AudioContext) {}

  public createTwoOscillatorVoiceFactory(): ITwoOscillatorVoiceFactory {
    return new TwoOscillatorVoiceFactory(
      this.context,
      WebAudioOscillatorGraphFactory.createDefault(
        this.context as unknown as IOscillatorWebAudioContextLike,
      ),
      WebAudioEnvelopeGainGraphFactory.createDefault(
        this.context as unknown as IEnvelopeWebAudioContextLike,
      ),
      new TwoOscillatorVoiceDefinitionValidator(),
    );
  }
}