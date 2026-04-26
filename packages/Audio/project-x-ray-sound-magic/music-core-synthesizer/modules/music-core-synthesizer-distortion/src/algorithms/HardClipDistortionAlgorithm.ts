import type {
  DistortionAudioSampleValue,
  DistortionSampleRateHzValue,
  IHardClipDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import { DistortionMath } from "../math/index.js";
import type { IDistortionAlgorithm } from "./IDistortionAlgorithm.js";

export class HardClipDistortionAlgorithm
  implements IDistortionAlgorithm<IHardClipDistortionDefinition> {
  public process(
    input: DistortionAudioSampleValue,
    definition: IHardClipDistortionDefinition,
    _sampleRateHz: DistortionSampleRateHzValue,
  ): DistortionAudioSampleValue {
    return DistortionMath.clamp(
      input,
      -definition.threshold,
      definition.threshold,
    );
  }

  public reset(): void {}
}
