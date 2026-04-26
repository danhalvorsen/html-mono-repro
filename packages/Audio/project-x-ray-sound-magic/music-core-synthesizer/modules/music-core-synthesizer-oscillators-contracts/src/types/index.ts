import type {
  BipolarNormalizedValue,
  DetuneCentsValue as SharedDetuneCentsValue,
  FrequencyHzValue as SharedFrequencyHzValue,
  LinearGainValue,
  PhaseRadiansValue as SharedPhaseRadiansValue,
  SampleRateHzValue as SharedSampleRateHzValue,
  SecondsValue as SharedSecondsValue,
  UnipolarNormalizedValue,
} from "@monorepo/music-core-synthesizer-parameters";

export type FrequencyHzValue = SharedFrequencyHzValue;
export type DetuneCentsValue = SharedDetuneCentsValue;
export type PhaseRadiansValue = SharedPhaseRadiansValue;
export type SampleRateHzValue = SharedSampleRateHzValue;
export type SecondsValue = SharedSecondsValue;

export type AudioSampleValue = BipolarNormalizedValue;
export type OscillatorGainValue = LinearGainValue;
export type OscillatorVelocityValue = UnipolarNormalizedValue;
export type PulseWidthValue = UnipolarNormalizedValue;
