import type {
  DistortionAudioSampleValue,
  DistortionSampleRateHzValue,
  ITanhDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import { DistortionMath } from "../math/index.js";
import type { IDistortionAlgorithm } from "./IDistortionAlgorithm.js";

export class TanhDistortionAlgorithm
  implements IDistortionAlgorithm<ITanhDistortionDefinition> {
  public process(
    input: DistortionAudioSampleValue,
    definition: ITanhDistortionDefinition,
    _sampleRateHz: DistortionSampleRateHzValue,
  ): DistortionAudioSampleValue {
    const drive = 1 + definition.amount * 16;

    return DistortionMath.clampBipolar(Math.tanh(input * drive));
  }

  public reset(): void {}
}
