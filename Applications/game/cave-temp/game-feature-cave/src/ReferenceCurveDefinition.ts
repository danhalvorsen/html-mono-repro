import { ReferenceCurveTermKind } from './ReferenceCurveTermKind.js';

export interface ReferenceCurveDefinition {
  readonly frame: ReferenceCurveFrameDefinition;
  readonly expression: ReferenceCurveExpressionDefinition;
}

export interface ReferenceCurveFrameDefinition {
  readonly canvas: {
    readonly length: number;
  };
  readonly sampling: {
    readonly samplesPerFrame: number;
  };
}

export interface ReferenceCurveExpressionDefinition {
  readonly vertical: {
    readonly baselineY: number;
    readonly amplitude: number;
  };
  readonly horizontal: {
    readonly periodsAcrossFrame: number;
    readonly phase?: number;
  };
  readonly terms: readonly ReferenceCurveTermDefinition[];
}

export type ReferenceCurveTermDefinition =
  | SineReferenceCurveTermDefinition
  | ArcSineSineReferenceCurveTermDefinition;

export interface SineReferenceCurveTermDefinition {
  readonly kind: typeof ReferenceCurveTermKind.Sine;
  readonly coefficient: {
    readonly weight: number;
  };
  readonly frequency: {
    readonly periodMultiplier: number;
  };
  readonly phase: {
    readonly multiplier: number;
  };
}

export interface ArcSineSineReferenceCurveTermDefinition {
  readonly kind: typeof ReferenceCurveTermKind.ArcSineSine;
  readonly coefficient: {
    readonly weight: number;
  };
  readonly frequency: {
    readonly periodMultiplier: number;
  };
  readonly phase: {
    readonly multiplier: number;
  };
  readonly normalization?: {
    readonly divisor: number;
  };
}
