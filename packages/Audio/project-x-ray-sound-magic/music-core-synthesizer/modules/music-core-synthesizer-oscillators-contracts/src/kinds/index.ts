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
