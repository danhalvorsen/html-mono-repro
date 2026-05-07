import type { ReferenceCurveDefinition } from './ReferenceCurveDefinition.js';
import { ReferenceCurveTermKind } from './ReferenceCurveTermKind.js';

export const defaultReferenceCurveDefinition: ReferenceCurveDefinition = {
  frame: {
    canvas: {
      length: 500,
    },
    sampling: {
      samplesPerFrame: 700,
    },
  },
  expression: {
    vertical: {
      baselineY: 150,
      amplitude: 100,
    },
    horizontal: {
      periodsAcrossFrame: 4,
      phase: 0,
    },
    terms: [
      {
        kind: ReferenceCurveTermKind.Sine,
        coefficient: {
          weight: 0.62,
        },
        frequency: {
          periodMultiplier: 1,
        },
        phase: {
          multiplier: 1,
        },
      },
      {
        kind: ReferenceCurveTermKind.Sine,
        coefficient: {
          weight: 0.24,
        },
        frequency: {
          periodMultiplier: 2.2,
        },
        phase: {
          multiplier: 1.37,
        },
      },
      {
        kind: ReferenceCurveTermKind.Sine,
        coefficient: {
          weight: 0.08,
        },
        frequency: {
          periodMultiplier: 3.8,
        },
        phase: {
          multiplier: 1.9,
        },
      },
      {
        kind: ReferenceCurveTermKind.ArcSineSine,
        coefficient: {
          weight: 0.015,
        },
        frequency: {
          periodMultiplier: 5.2,
        },
        phase: {
          multiplier: 2.3,
        },
        normalization: {
          divisor: Math.PI / 2,
        },
      },
    ],
  },
};
