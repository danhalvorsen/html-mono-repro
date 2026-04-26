import type {
  OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type { IOscillatorAlgorithm } from "./IOscillatorAlgorithm.js";

export interface IOscillatorAlgorithmFactory {
  create(definition: OscillatorDefinition): IOscillatorAlgorithm;
}
