import type { OscillatorModel } from "../OscillatorControl/OscillatorModel.js";

export type SynthesizerModel = Readonly<{
  oscillators: readonly OscillatorModel[];
  mixerLevel: number;
}>;
