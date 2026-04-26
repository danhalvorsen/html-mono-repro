import type { OscillatorDefinition } from "../definitions/index.js";
import type {
  AudioSampleValue,
  DetuneCentsValue,
  FrequencyHzValue,
  OscillatorGainValue,
  OscillatorVelocityValue,
  PhaseRadiansValue,
  SampleRateHzValue,
  SecondsValue,
} from "../types/index.js";

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
