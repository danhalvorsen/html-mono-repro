import type {
  DistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import type { IDistortionAlgorithm } from "./IDistortionAlgorithm.js";

export interface IDistortionAlgorithmFactory {
  create(definition: DistortionDefinition): IDistortionAlgorithm;
}
