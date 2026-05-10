export const ReferenceCurveTermKind = {
  Sine: 'sine',
  ArcSineSine: 'arc-sine-sine',
} as const;

export type ReferenceCurveTermKind =
  (typeof ReferenceCurveTermKind)[keyof typeof ReferenceCurveTermKind];
