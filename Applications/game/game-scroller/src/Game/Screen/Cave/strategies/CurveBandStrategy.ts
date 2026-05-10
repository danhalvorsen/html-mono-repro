import type { Point2 } from '@monorepo/core-math';
import type { ICurveVariationProfile } from './SkewNormalVariationStrategy.js';

export interface ICurveBandProjectionContext {
  readonly referenceY: number;
  readonly index: number;
  readonly normalizedX: number;
  readonly variation: ICurveVariationProfile;
}

export interface ILowerCurveBandStrategyOptions {
  readonly baselineY: number;
  readonly periodsAcrossFrame: number;
  readonly flattenStrength: number;
  readonly flattenPeriodScale: number;
  readonly minDistanceFromReference: number;
}

export interface IUpperCurveBandStrategyOptions {
  readonly minDistanceFromReference: number;
}

export interface ICurveBandStrategy {
  project(context: ICurveBandProjectionContext): number;
}

export interface IPointSamplingContext {
  readonly x: number;
  readonly normalizedX: number;
  readonly index: number;
}

export interface IBuildPointsOptions {
  readonly frameLength: number;
  readonly sampleCount: number;
  readonly yAt: (context: IPointSamplingContext) => number;
}

export interface ICreateProjectionContextOptions {
  readonly point: Point2;
  readonly index: number;
  readonly frameLength: number;
  readonly variation: ICurveVariationProfile;
}

export class UpperCurveBandStrategy implements ICurveBandStrategy {
  readonly #options: IUpperCurveBandStrategyOptions;

  public constructor(options: IUpperCurveBandStrategyOptions) {
    this.#options = options;
  }

  public project(context: ICurveBandProjectionContext): number {
    const offset = context.variation.offset[context.index] ?? 0;
    const shape = context.variation.shape[context.index] ?? 0;
    return Math.min(
      context.referenceY - offset + shape,
      context.referenceY - this.#options.minDistanceFromReference
    );
  }
}

export class LowerCurveBandStrategy implements ICurveBandStrategy {
  readonly #options: ILowerCurveBandStrategyOptions;

  public constructor(options: ILowerCurveBandStrategyOptions) {
    this.#options = options;
  }

  public project(context: ICurveBandProjectionContext): number {
    const offset = context.variation.offset[context.index] ?? 0;
    const shape = context.variation.shape[context.index] ?? 0;

    const wave = Math.sin(
      2 * Math.PI * (this.#options.periodsAcrossFrame * this.#options.flattenPeriodScale) * context.normalizedX + 0.7
    );
    const normalized = (wave + 1) / 2;
    const flatten = normalized * this.#options.flattenStrength;
    const suppressedReference =
      this.#options.baselineY + (context.referenceY - this.#options.baselineY) * (1 - flatten);

    return Math.max(
      suppressedReference + offset + shape,
      context.referenceY + this.#options.minDistanceFromReference
    );
  }
}

export function buildPoints(options: IBuildPointsOptions): Point2[] {
  const dx = options.frameLength / options.sampleCount;
  const points: Point2[] = [];

  for (let i = 0; i <= options.sampleCount; i += 1) {
    const x = dx * i;
    const normalizedX = x / options.frameLength;
    points.push({
      x,
      y: options.yAt({ x, normalizedX, index: i })
    });
  }

  return points;
}

export function createProjectionContext(options: ICreateProjectionContextOptions): ICurveBandProjectionContext {
  return {
    referenceY: options.point.y,
    index: options.index,
    normalizedX: options.point.x / options.frameLength,
    variation: options.variation
  };
}
