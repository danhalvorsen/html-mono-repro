import type {
  BipolarNormalizedValue,
  LinearGainValue,
  SampleRateHzValue,
  UnipolarNormalizedValue,
} from "@monorepo/music-core-synthesizer-parameters";

export type DistortionAmountValue = UnipolarNormalizedValue;
export type DistortionMixValue = UnipolarNormalizedValue;
export type DistortionInputGainValue = LinearGainValue;
export type DistortionOutputGainValue = LinearGainValue;
export type DistortionThresholdValue = UnipolarNormalizedValue;
export type DistortionDriveValue = LinearGainValue;
export type DistortionAudioSampleValue = BipolarNormalizedValue;
export type DistortionSampleRateHzValue = SampleRateHzValue;

export type BitDepthValue = number;
export type SampleRateReductionValue = number;
