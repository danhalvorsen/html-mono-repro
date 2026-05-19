export const FilterType = {
  LowPass: "lowpass",
  HighPass: "highpass",
  BandPass: "bandpass",
} as const;

export type FilterType = (typeof FilterType)[keyof typeof FilterType];
