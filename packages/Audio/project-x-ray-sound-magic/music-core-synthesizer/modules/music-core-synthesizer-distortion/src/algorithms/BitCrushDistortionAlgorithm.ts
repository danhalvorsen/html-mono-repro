import type {
  DistortionAudioSampleValue,
  DistortionSampleRateHzValue,
  IBitCrushDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import { DistortionMath } from "../math/index.js";
import type { IDistortionAlgorithm } from "./IDistortionAlgorithm.js";

export class BitCrushDistortionAlgorithm
  implements IDistortionAlgorithm<IBitCrushDistortionDefinition> {
  private holdCounter = 0;
  private heldSample: DistortionAudioSampleValue = 0;

  public process(
    input: DistortionAudioSampleValue,
    definition: IBitCrushDistortionDefinition,
    _sampleRateHz: DistortionSampleRateHzValue,
  ): DistortionAudioSampleValue {
    if (this.holdCounter <= 0) {
      this.heldSample = DistortionMath.quantizeBipolar(input, definition.bitDepth);
      this.holdCounter = definition.sampleRateReduction;
    }

    this.holdCounter -= 1;

    return this.heldSample;
  }

  public reset(): void {
    this.holdCounter = 0;
    this.heldSample = 0;
  }
}
