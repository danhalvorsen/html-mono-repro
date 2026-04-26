import type {
  AudioSampleValue,
  IPulseOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import { OscillatorMath } from "../math/index.js";
import type { IOscillatorAlgorithm } from "./IOscillatorAlgorithm.js";

export class PulseOscillatorAlgorithm
  implements IOscillatorAlgorithm<IPulseOscillatorDefinition> {
  public sample(
    definition: IPulseOscillatorDefinition,
    phase01: number,
  ): AudioSampleValue {
    return OscillatorMath.wrap01(phase01) < definition.pulseWidth ? 1 : -1;
  }
}
