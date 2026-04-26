import {
  OscillatorKind,
  type OscillatorKind as OscillatorKindValue,
  type OscillatorWaveformKind,
} from "../kinds/index.js";
import type {
  DetuneCentsValue,
  FrequencyHzValue,
  OscillatorGainValue,
  PhaseRadiansValue,
  PulseWidthValue,
} from "../types/index.js";

export interface IOscillatorDefinition {
  readonly kind: OscillatorKindValue;
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
