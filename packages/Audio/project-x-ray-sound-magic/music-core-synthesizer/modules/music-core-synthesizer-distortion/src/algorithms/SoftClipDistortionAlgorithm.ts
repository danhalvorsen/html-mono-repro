import {
  DistortionCurveKind,
  type DistortionAudioSampleValue,
  type DistortionSampleRateHzValue,
  type ISoftClipDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import { DistortionMath } from "../math/index.js";
import type { IDistortionAlgorithm } from "./IDistortionAlgorithm.js";

export class SoftClipDistortionAlgorithm
  implements IDistortionAlgorithm<ISoftClipDistortionDefinition> {
  public process(
    input: DistortionAudioSampleValue,
    definition: ISoftClipDistortionDefinition,
    _sampleRateHz: DistortionSampleRateHzValue,
  ): DistortionAudioSampleValue {
    const linear = DistortionMath.clampBipolar(input);
    const curved = this.evaluateCurve(linear, definition);

    return DistortionMath.mix(linear, curved, definition.amount);
  }

  public reset(): void {}

  private evaluateCurve(
    input: DistortionAudioSampleValue,
    definition: ISoftClipDistortionDefinition,
  ): DistortionAudioSampleValue {
    const drive = 1 + definition.amount * 12;

    switch (definition.curve) {
      case DistortionCurveKind.Linear:
        return input;

      case DistortionCurveKind.Cubic:
        return DistortionMath.clampBipolar(input - (input * input * input) / 3);

      case DistortionCurveKind.Arctangent:
        return DistortionMath.clampBipolar((2 / Math.PI) * Math.atan(drive * input));

      case DistortionCurveKind.Tanh:
        return DistortionMath.clampBipolar(Math.tanh(drive * input));

      default:
        throw new Error(`Unsupported distortion curve kind: ${String(definition.curve)}`);
    }
  }
}
