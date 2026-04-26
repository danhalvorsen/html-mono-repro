import type {
  DistortionAudioSampleValue,
  DistortionSampleRateHzValue,
  IFoldbackDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import { DistortionMath } from "../math/index.js";
import type { IDistortionAlgorithm } from "./IDistortionAlgorithm.js";

export class FoldbackDistortionAlgorithm
  implements IDistortionAlgorithm<IFoldbackDistortionDefinition> {
  public process(
    input: DistortionAudioSampleValue,
    definition: IFoldbackDistortionDefinition,
    _sampleRateHz: DistortionSampleRateHzValue,
  ): DistortionAudioSampleValue {
    return DistortionMath.foldback(input, definition.threshold);
  }

  public reset(): void {}
}
