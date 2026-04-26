import {
  DistortionCurveKind,
  DistortionKind,
  type DistortionDefinition,
  type IBitCrushDistortionDefinition,
  type IFoldbackDistortionDefinition,
  type IHardClipDistortionDefinition,
  type ISoftClipDistortionDefinition,
  type ITanhDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import { WebAudioDistortionMath } from "../math/index.js";
import type { IWaveShaperCurveFactory } from "./IWaveShaperCurveFactory.js";

export interface IWaveShaperCurveFactoryOptions {
  readonly curveLength: number;
}

export class WaveShaperCurveFactory implements IWaveShaperCurveFactory {
  private readonly curveLength: number;

  public constructor(options: IWaveShaperCurveFactoryOptions = { curveLength: 2048 }) {
    if (!Number.isInteger(options.curveLength) || options.curveLength < 2) {
      throw new Error("curveLength must be an integer greater than or equal to 2.");
    }

    this.curveLength = options.curveLength;
  }

  public create(definition: DistortionDefinition): Float32Array {
    switch (definition.kind) {
      case DistortionKind.Bypass:
        return this.createCurve((input) => input);

      case DistortionKind.HardClip:
        return this.createHardClipCurve(definition);

      case DistortionKind.SoftClip:
        return this.createSoftClipCurve(definition);

      case DistortionKind.Tanh:
        return this.createTanhCurve(definition);

      case DistortionKind.Foldback:
        return this.createFoldbackCurve(definition);

      case DistortionKind.BitCrush:
        return this.createBitCrushCurve(definition);
    }
  }

  private createHardClipCurve(definition: IHardClipDistortionDefinition): Float32Array {
    return this.createCurve((input) =>
      WebAudioDistortionMath.clamp(
        input,
        -definition.threshold,
        definition.threshold,
      ),
    );
  }

  private createSoftClipCurve(definition: ISoftClipDistortionDefinition): Float32Array {
    const drive = 1 + definition.amount * 12;

    return this.createCurve((input) => {
      switch (definition.curve) {
        case DistortionCurveKind.Linear:
          return input;

        case DistortionCurveKind.Cubic:
          return WebAudioDistortionMath.clampBipolar(
            input - (input * input * input) / 3,
          );

        case DistortionCurveKind.Arctangent:
          return WebAudioDistortionMath.clampBipolar(
            (2 / Math.PI) * Math.atan(drive * input),
          );

        case DistortionCurveKind.Tanh:
          return WebAudioDistortionMath.clampBipolar(
            Math.tanh(drive * input),
          );

        default:
          throw new Error(`Unsupported distortion curve kind: ${String(definition.curve)}`);
      }
    });
  }

  private createTanhCurve(definition: ITanhDistortionDefinition): Float32Array {
    const drive = 1 + definition.amount * 16;

    return this.createCurve((input) =>
      WebAudioDistortionMath.clampBipolar(Math.tanh(input * drive)),
    );
  }

  private createFoldbackCurve(definition: IFoldbackDistortionDefinition): Float32Array {
    return this.createCurve((input) =>
      WebAudioDistortionMath.foldback(input, definition.threshold),
    );
  }

  private createBitCrushCurve(definition: IBitCrushDistortionDefinition): Float32Array {
    if (definition.sampleRateReduction !== 1) {
      throw new Error(
        "Bit-crush sampleRateReduction requires an AudioWorklet adapter. WaveShaperNode can only approximate bit-depth quantization.",
      );
    }

    return this.createCurve((input) =>
      WebAudioDistortionMath.quantizeBipolar(input, definition.bitDepth),
    );
  }

  private createCurve(transform: (input: number) => number): Float32Array {
    const curve = new Float32Array(this.curveLength);

    for (let index = 0; index < this.curveLength; index += 1) {
      const input = (index / (this.curveLength - 1)) * 2 - 1;
      curve[index] = WebAudioDistortionMath.clampBipolar(transform(input));
    }

    return curve;
  }
}
