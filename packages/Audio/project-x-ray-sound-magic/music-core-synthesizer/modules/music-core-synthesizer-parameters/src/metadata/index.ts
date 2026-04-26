export const ParameterKind = {
  Frequency: "frequency",
  Normalized: "normalized",
  Time: "time",
  Gain: "gain",
  Ratio: "ratio",
  Phase: "phase",
  Filter: "filter",
  Count: "count",
  Percentage: "percentage",
} as const;

export type ParameterKind = (typeof ParameterKind)[keyof typeof ParameterKind];

export const ParameterUnit = {
  Hertz: "Hz",
  Seconds: "s",
  Milliseconds: "ms",
  Samples: "samples",
  Normalized: "normalized",
  Percentage: "%",
  Cents: "cents",
  Semitones: "semitones",
  Octaves: "octaves",
  Decibels: "dB",
  LinearGain: "linear-gain",
  Ratio: "ratio",
  Radians: "rad",
  Unitless: "unitless",
} as const;

export type ParameterUnit = (typeof ParameterUnit)[keyof typeof ParameterUnit];

export interface IParameterRangeDescriptor<TValue extends number = number> {
  readonly minimum: TValue;
  readonly maximum: TValue;
}

export interface IParameterDescriptor<TValue extends number = number> {
  readonly id: string;
  readonly name: string;
  readonly kind: ParameterKind;
  readonly unit: ParameterUnit;
  readonly range?: IParameterRangeDescriptor<TValue>;
  readonly defaultValue?: TValue;
}
