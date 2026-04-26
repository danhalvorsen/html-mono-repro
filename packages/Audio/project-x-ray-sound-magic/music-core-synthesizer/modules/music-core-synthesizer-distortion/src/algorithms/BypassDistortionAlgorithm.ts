import type {
  DistortionAudioSampleValue,
  DistortionSampleRateHzValue,
  IBypassDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import type { IDistortionAlgorithm } from "./IDistortionAlgorithm.js";

export class BypassDistortionAlgorithm
  implements IDistortionAlgorithm<IBypassDistortionDefinition> {
  public process(
    input: DistortionAudioSampleValue,
    _definition: IBypassDistortionDefinition,
    _sampleRateHz: DistortionSampleRateHzValue,
  ): DistortionAudioSampleValue {
    return input;
  }

  public reset(): void {}
}
