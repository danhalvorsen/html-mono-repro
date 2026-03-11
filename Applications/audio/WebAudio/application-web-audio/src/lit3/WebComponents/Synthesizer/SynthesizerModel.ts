// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Synthesizer/SynthesizerModel.ts

import type { OscillatorModel } from "../OscillatorControl/OscillatorModel.js";

export type SynthesizerModel = Readonly<{
  oscillators: readonly OscillatorModel[];
  mixerLevel: number;
}>;