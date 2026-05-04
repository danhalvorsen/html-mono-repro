import { EstimateRange, EstimateShape, SkewNormalEstimateDistribution } from '@monorepo/core-math-probability';
import type { INormalizedCurveControlOptions } from '../CurveOptions.js';
import { movingAverageBackward, smoothSeries, suppressSpike } from './VariationMath.js';

const SHAPE_MULTIPLIER = 0.35;

export interface ICurveVariationProfile {
  readonly offset: readonly number[];
  readonly shape: readonly number[];
}

export interface IVariationStrategy {
  create(options: INormalizedCurveControlOptions, sampleCount: number): ICurveVariationProfile;
}

export class SkewNormalVariationStrategy implements IVariationStrategy {
  readonly #shapeTailWeight: number;

  public constructor(shapeTailWeight = 1) {
    this.#shapeTailWeight = shapeTailWeight;
  }

  public create(options: INormalizedCurveControlOptions, sampleCount: number): ICurveVariationProfile {
    const dist = new SkewNormalEstimateDistribution(
      new EstimateRange(
        options.distribution.interval.min,
        (options.distribution.interval.min + options.distribution.interval.max) / 2,
        options.distribution.interval.max
      ),
      new EstimateShape(0.7, options.distribution.skew, this.#shapeTailWeight)
    );

    const rawOffset: number[] = [];
    const rawShape: number[] = [];
    const smoothOffset: number[] = [];
    const smoothShape: number[] = [];
    const center = (options.distribution.interval.min + options.distribution.interval.max) / 2;

    for (let i = 0; i <= sampleCount; i += 1) {
      rawOffset.push(Math.abs(dist.sample(options.runtime.randomSource)));
      rawShape.push(dist.sample(options.runtime.randomSource));
    }

    for (let i = 0; i <= sampleCount; i += 1) {
      const avgOffset = movingAverageBackward({ values: rawOffset, index: i, windowSize: options.noise.noiseWindowSize });
      const offsetRaw = avgOffset * options.distribution.variationInfluence;
      const offsetSuppressed = suppressSpike({
        value: offsetRaw,
        localAverage: avgOffset,
        factor: options.noise.spikeSuppressionFactor
      });
      const offset = Math.min(offsetSuppressed, options.limits.maxOffsetFromReference);

      const avgShape = movingAverageBackward({ values: rawShape, index: i, windowSize: options.noise.noiseWindowSize });
      const localShape = (avgShape - center) * SHAPE_MULTIPLIER * options.noise.noiseAmplifier;

      smoothOffset.push(offset);
      smoothShape.push(localShape);
    }

    return {
      offset: smoothSeries({ values: smoothOffset, passes: options.noise.profileSmoothingPasses }),
      shape: smoothSeries({ values: smoothShape, passes: options.noise.profileSmoothingPasses + 1 })
    };
  }
}
