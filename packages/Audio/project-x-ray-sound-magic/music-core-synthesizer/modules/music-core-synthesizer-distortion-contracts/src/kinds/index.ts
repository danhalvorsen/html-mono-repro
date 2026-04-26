export const DistortionKind = {
  Bypass: "bypass",
  HardClip: "hard-clip",
  SoftClip: "soft-clip",
  Tanh: "tanh",
  Foldback: "foldback",
  BitCrush: "bit-crush",
} as const;

export type DistortionKind =
  (typeof DistortionKind)[keyof typeof DistortionKind];

export const DistortionCurveKind = {
  Linear: "linear",
  Cubic: "cubic",
  Arctangent: "arctangent",
  Tanh: "tanh",
} as const;

export type DistortionCurveKind =
  (typeof DistortionCurveKind)[keyof typeof DistortionCurveKind];
