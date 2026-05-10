import { Mulberry32RandomSource } from '@monorepo/core-math-probability';
import type {
  ICurveControlOptions,
  ICurveInterval,
  IGamePolygonGeneratorOptions,
  INormalizedCurveControlOptions,
  INormalizedGeneratorOptions
} from './CurveOptions.js';

const DEFAULT_GLOBAL_OPTIONS = {
  periodsAcrossFrame: 4,
  baselineY: 150,
  samplesPerFrame: 700,
  maxOffsetFromReference: 140,
  minDistanceFromReference: 8,
  noiseWindowSize: 24,
  noiseAmplifier: 3,
  profileSmoothingPasses: 2,
  spikeSuppressionFactor: 1.35,
  flattenStrength: 0.45,
  flattenPeriodScale: 0.55,
  variationInfluence: 1,
  randomSeed: 12345
} as const;

type CurveProfileDefaults = Readonly<{
  interval: ICurveInterval;
  skew: number;
}>;

const DEFAULT_REFERENCE_PROFILE: CurveProfileDefaults = {
  interval: { min: 14, max: 28 },
  skew: 0.5
};

const DEFAULT_UPPER_PROFILE: CurveProfileDefaults = {
  interval: { min: 14, max: 28 },
  skew: 0.5
};

const DEFAULT_LOWER_PROFILE: CurveProfileDefaults = {
  interval: { min: 14, max: 28 },
  skew: -0.15
};

export class CurveOptionsBuilder {
  public build(options: IGamePolygonGeneratorOptions): INormalizedGeneratorOptions {
    const reference = this.#normalize(options.reference, DEFAULT_REFERENCE_PROFILE);
    const upper = this.#normalize(options.upper, DEFAULT_UPPER_PROFILE);
    const lower = this.#normalize(options.lower, DEFAULT_LOWER_PROFILE);

    return {
      frame: {
        canvasLength: reference.geometry.canvasLength,
        samplesPerFrame: reference.geometry.samplesPerFrame
      },
      reference,
      upper,
      lower
    };
  }

  #normalize(
    options: ICurveControlOptions,
    profileDefaults: CurveProfileDefaults
  ): INormalizedCurveControlOptions {
    return {
      geometry: {
        canvasLength: options.geometry.canvasLength,
        amplitude: options.geometry.amplitude,
        periodsAcrossFrame: options.geometry.periodsAcrossFrame ?? DEFAULT_GLOBAL_OPTIONS.periodsAcrossFrame,
        baselineY: options.geometry.baselineY ?? DEFAULT_GLOBAL_OPTIONS.baselineY,
        samplesPerFrame: options.geometry.samplesPerFrame ?? DEFAULT_GLOBAL_OPTIONS.samplesPerFrame
      },
      distribution: {
        interval: options.distribution?.interval ?? profileDefaults.interval,
        skew: options.distribution?.skew ?? profileDefaults.skew,
        variationInfluence: options.distribution?.variationInfluence ?? DEFAULT_GLOBAL_OPTIONS.variationInfluence
      },
      noise: {
        noiseAmplifier: options.noise?.noiseAmplifier ?? DEFAULT_GLOBAL_OPTIONS.noiseAmplifier,
        noiseWindowSize: options.noise?.noiseWindowSize ?? DEFAULT_GLOBAL_OPTIONS.noiseWindowSize,
        profileSmoothingPasses: options.noise?.profileSmoothingPasses ?? DEFAULT_GLOBAL_OPTIONS.profileSmoothingPasses,
        spikeSuppressionFactor: options.noise?.spikeSuppressionFactor ?? DEFAULT_GLOBAL_OPTIONS.spikeSuppressionFactor
      },
      shape: {
        flattenStrength: options.shape?.flattenStrength ?? DEFAULT_GLOBAL_OPTIONS.flattenStrength,
        flattenPeriodScale: options.shape?.flattenPeriodScale ?? DEFAULT_GLOBAL_OPTIONS.flattenPeriodScale
      },
      limits: {
        maxOffsetFromReference: options.limits?.maxOffsetFromReference ?? DEFAULT_GLOBAL_OPTIONS.maxOffsetFromReference,
        minDistanceFromReference: options.limits?.minDistanceFromReference ?? DEFAULT_GLOBAL_OPTIONS.minDistanceFromReference
      },
      runtime: {
        randomSource: options.runtime?.randomSource ?? new Mulberry32RandomSource(DEFAULT_GLOBAL_OPTIONS.randomSeed)
      }
    };
  }
}
