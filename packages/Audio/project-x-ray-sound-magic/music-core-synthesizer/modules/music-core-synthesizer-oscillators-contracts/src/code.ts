// FILE: modules/parts/oscillators/music-core-synthesizer-oscillators-contracts/src/code.ts

import type {
  BipolarNormalizedValue,
  DetuneCentsValue,
  FrequencyHzValue,
  LinearGainValue,
  PhaseRadiansValue,
  SampleRateHzValue,
  SecondsValue,
  UnipolarNormalizedValue,
} from "@monorepo/music-core-synthesizer-parameters";

export const OscillatorKind = {
  Basic: "basic",
  Pulse: "pulse",
  Wavetable: "wavetable",
  Sample: "sample",
} as const;

export type OscillatorKind =
  (typeof OscillatorKind)[keyof typeof OscillatorKind];

export const OscillatorWaveformKind = {
  Sine: "sine",
  Square: "square",
  Sawtooth: "sawtooth",
  Triangle: "triangle",
} as const;

export type OscillatorWaveformKind =
  (typeof OscillatorWaveformKind)[keyof typeof OscillatorWaveformKind];

export type AudioSampleValue = BipolarNormalizedValue;
export type OscillatorGainValue = LinearGainValue;
export type OscillatorVelocityValue = UnipolarNormalizedValue;
export type PulseWidthValue = UnipolarNormalizedValue;

export interface IOscillatorDefinition {
  readonly kind: OscillatorKind;
  readonly gain: OscillatorGainValue;
}

export interface IBasicOscillatorDefinition extends IOscillatorDefinition {
  readonly kind: typeof OscillatorKind.Basic;
  readonly waveform: OscillatorWaveformKind;
  readonly frequencyHz: FrequencyHzValue;
  readonly detuneCents: DetuneCentsValue;
  readonly phaseRadians: PhaseRadiansValue;
}

export interface IPulseOscillatorDefinition extends IOscillatorDefinition {
  readonly kind: typeof OscillatorKind.Pulse;
  readonly frequencyHz: FrequencyHzValue;
  readonly detuneCents: DetuneCentsValue;
  readonly phaseRadians: PhaseRadiansValue;
  readonly pulseWidth: PulseWidthValue;
}

export interface IWavetableOscillatorDefinition extends IOscillatorDefinition {
  readonly kind: typeof OscillatorKind.Wavetable;
  readonly tableId: string;
  readonly frequencyHz: FrequencyHzValue;
  readonly detuneCents: DetuneCentsValue;
  readonly phaseRadians: PhaseRadiansValue;
}

export interface ISampleOscillatorDefinition extends IOscillatorDefinition {
  readonly kind: typeof OscillatorKind.Sample;
  readonly sampleId: string;
  readonly rootFrequencyHz: FrequencyHzValue;
  readonly playbackFrequencyHz: FrequencyHzValue;
  readonly loop: boolean;
}

export type OscillatorDefinition =
  | IBasicOscillatorDefinition
  | IPulseOscillatorDefinition
  | IWavetableOscillatorDefinition
  | ISampleOscillatorDefinition;

export interface IOscillatorNoteOnRequest {
  readonly timeSeconds: SecondsValue;
  readonly frequencyHz: FrequencyHzValue;
  readonly velocity: OscillatorVelocityValue;
}

export interface IOscillatorNoteOffRequest {
  readonly timeSeconds: SecondsValue;
}

export interface IOscillatorSampleRequest {
  readonly timeSeconds: SecondsValue;
  readonly sampleRateHz: SampleRateHzValue;
}

export interface IOscillatorSample {
  readonly timeSeconds: SecondsValue;
  readonly value: AudioSampleValue;
}

export interface IOscillatorStateSnapshot {
  readonly definition: OscillatorDefinition;
  readonly frequencyHz: FrequencyHzValue;
  readonly detuneCents: DetuneCentsValue;
  readonly phaseRadians: PhaseRadiansValue;
  readonly gain: OscillatorGainValue;
  readonly isActive: boolean;
}

export interface IOscillator {
  readonly definition: OscillatorDefinition;

  noteOn(request: IOscillatorNoteOnRequest): void;

  noteOff(request: IOscillatorNoteOffRequest): void;

  sample(request: IOscillatorSampleRequest): IOscillatorSample;

  snapshot(): IOscillatorStateSnapshot;

  reset(): void;
}

export interface IOscillatorFactory {
  create(definition: OscillatorDefinition): IOscillator;
}

export interface IOscillatorDefinitionValidator {
  validate(definition: OscillatorDefinition): void;
}