import {
  DistortionCurveKind,
  DistortionKind,
  type DistortionCurveKind as DistortionCurveKindValue,
  type DistortionKind as DistortionKindValue,
} from "../kinds/index.js";
import type {
  BitDepthValue,
  DistortionAmountValue,
  DistortionInputGainValue,
  DistortionMixValue,
  DistortionOutputGainValue,
  DistortionThresholdValue,
  SampleRateReductionValue,
} from "../types/index.js";

export interface IDistortionDefinition {
  readonly kind: DistortionKindValue;
  readonly inputGain: DistortionInputGainValue;
  readonly outputGain: DistortionOutputGainValue;
  readonly mix: DistortionMixValue;
}

export interface IBypassDistortionDefinition extends IDistortionDefinition {
  readonly kind: typeof DistortionKind.Bypass;
}

export interface IHardClipDistortionDefinition extends IDistortionDefinition {
  readonly kind: typeof DistortionKind.HardClip;
  readonly threshold: DistortionThresholdValue;
}

export interface ISoftClipDistortionDefinition extends IDistortionDefinition {
  readonly kind: typeof DistortionKind.SoftClip;
  readonly amount: DistortionAmountValue;
  readonly curve: DistortionCurveKindValue;
}

export interface ITanhDistortionDefinition extends IDistortionDefinition {
  readonly kind: typeof DistortionKind.Tanh;
  readonly amount: DistortionAmountValue;
}

export interface IFoldbackDistortionDefinition extends IDistortionDefinition {
  readonly kind: typeof DistortionKind.Foldback;
  readonly threshold: DistortionThresholdValue;
}

export interface IBitCrushDistortionDefinition extends IDistortionDefinition {
  readonly kind: typeof DistortionKind.BitCrush;
  readonly bitDepth: BitDepthValue;
  readonly sampleRateReduction: SampleRateReductionValue;
}

export type DistortionDefinition =
  | IBypassDistortionDefinition
  | IHardClipDistortionDefinition
  | ISoftClipDistortionDefinition
  | ITanhDistortionDefinition
  | IFoldbackDistortionDefinition
  | IBitCrushDistortionDefinition;

export const DefaultDistortionCurves = {
  SoftClip: DistortionCurveKind.Tanh,
} as const;
