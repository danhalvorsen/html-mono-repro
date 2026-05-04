import type { IRandomSource } from '@monorepo/core-math-probability';

export interface ICurveInterval {
  readonly min: number;
  readonly max: number;
}

export interface ICurveGeometryOptions {
  readonly canvasLength: number;
  readonly amplitude: number;
  readonly periodsAcrossFrame?: number;
  readonly baselineY?: number;
  readonly samplesPerFrame?: number;
}

export interface ICurveDistributionOptions {
  readonly interval?: ICurveInterval;
  readonly skew?: number;
  readonly variationInfluence?: number;
}

export interface ICurveNoiseOptions {
  readonly noiseAmplifier?: number;
  readonly noiseWindowSize?: number;
  readonly profileSmoothingPasses?: number;
  readonly spikeSuppressionFactor?: number;
}

export interface ICurveShapeOptions {
  readonly flattenStrength?: number;
  readonly flattenPeriodScale?: number;
}

export interface ICurveLimitsOptions {
  readonly maxOffsetFromReference?: number;
}

export interface ICurveRuntimeOptions {
  readonly randomSource?: IRandomSource;
}

export interface ICurveControlOptions {
  readonly geometry: ICurveGeometryOptions;
  readonly distribution?: ICurveDistributionOptions;
  readonly noise?: ICurveNoiseOptions;
  readonly shape?: ICurveShapeOptions;
  readonly limits?: ICurveLimitsOptions;
  readonly runtime?: ICurveRuntimeOptions;
}

export interface IGamePolygonGeneratorOptions {
  readonly reference: ICurveControlOptions;
  readonly upper: ICurveControlOptions;
  readonly lower: ICurveControlOptions;
}

export interface INormalizedCurveGeometryOptions {
  readonly canvasLength: number;
  readonly amplitude: number;
  readonly periodsAcrossFrame: number;
  readonly baselineY: number;
  readonly samplesPerFrame: number;
}

export interface INormalizedCurveDistributionOptions {
  readonly interval: ICurveInterval;
  readonly skew: number;
  readonly variationInfluence: number;
}

export interface INormalizedCurveNoiseOptions {
  readonly noiseAmplifier: number;
  readonly noiseWindowSize: number;
  readonly profileSmoothingPasses: number;
  readonly spikeSuppressionFactor: number;
}

export interface INormalizedCurveShapeOptions {
  readonly flattenStrength: number;
  readonly flattenPeriodScale: number;
}

export interface INormalizedCurveLimitsOptions {
  readonly maxOffsetFromReference: number;
}

export interface INormalizedCurveRuntimeOptions {
  readonly randomSource: IRandomSource;
}

export interface INormalizedCurveControlOptions {
  readonly geometry: INormalizedCurveGeometryOptions;
  readonly distribution: INormalizedCurveDistributionOptions;
  readonly noise: INormalizedCurveNoiseOptions;
  readonly shape: INormalizedCurveShapeOptions;
  readonly limits: INormalizedCurveLimitsOptions;
  readonly runtime: INormalizedCurveRuntimeOptions;
}

export interface IFrameOptions {
  readonly canvasLength: number;
  readonly samplesPerFrame: number;
}

export interface INormalizedGeneratorOptions {
  readonly frame: IFrameOptions;
  readonly reference: INormalizedCurveControlOptions;
  readonly upper: INormalizedCurveControlOptions;
  readonly lower: INormalizedCurveControlOptions;
}
