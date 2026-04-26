import {
  OscillatorWaveformKind,
  type AudioSampleValue,
  type IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { OscillatorMath } from "../math/index.js";
import type { IOscillatorAlgorithm } from "./IOscillatorAlgorithm.js";

export class BasicOscillatorAlgorithm
  implements IOscillatorAlgorithm<IBasicOscillatorDefinition> {
  public sample(
    definition: IBasicOscillatorDefinition,
    phase01: number,
  ): AudioSampleValue {
    const phase = OscillatorMath.wrap01(phase01);

    switch (definition.waveform) {
      case OscillatorWaveformKind.Sine:
        return Math.sin(phase * OscillatorMath.twoPi);

      case OscillatorWaveformKind.Square:
        return phase < 0.5 ? 1 : -1;

      case OscillatorWaveformKind.Sawtooth:
        return phase * 2 - 1;

      case OscillatorWaveformKind.Triangle:
        return 1 - 4 * Math.abs(phase - 0.5);
    }
  }
}
