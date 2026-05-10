import type {
  IGamePolygonGeneratorOptions,
} from '@monorepo/game-objects';

export interface CaveCurveOptionsPresetResolver {
  resolve(preset: string): IGamePolygonGeneratorOptions;
}

export const CaveCurveOptionsPresetName = {
  Default: 'default',
  Training: 'training',
} as const;

export class DefaultCaveCurveOptionsPresetResolver
  implements CaveCurveOptionsPresetResolver
{
  public resolve(preset: string): IGamePolygonGeneratorOptions {
    if (preset === CaveCurveOptionsPresetName.Training) {
      return trainingCaveCurveOptions;
    }

    return defaultCaveCurveOptions;
  }
}

const defaultCaveCurveOptions: IGamePolygonGeneratorOptions = {
  reference: {
    geometry: {
      canvasLength: 500,
      samplesPerFrame: 700,
      amplitude: 100,
      baselineY: 150,
      periodsAcrossFrame: 4,
    },
    noise: {
      noiseWindowSize: 40,
      profileSmoothingPasses: 2,
      spikeSuppressionFactor: 1.35,
    },
  },
  upper: {
    geometry: {
      canvasLength: 500,
      amplitude: 100,
    },
    distribution: {
      interval: { min: 10, max: 24 },
      skew: 0.25,
      variationInfluence: 5,
    },
    noise: {
      noiseAmplifier: 18,
    },
    limits: {
      minDistanceFromReference: 50,
    },
  },
  lower: {
    geometry: {
      canvasLength: 500,
      amplitude: 0.000001,
    },
    distribution: {
      interval: { min: 2, max: 4 },
      skew: -0.1,
      variationInfluence: 0.75,
    },
    noise: {
      noiseAmplifier: 0.5,
    },
    shape: {
      flattenStrength: 1,
      flattenPeriodScale: 0.1,
    },
    limits: {
      minDistanceFromReference: 50,
      maxOffsetFromReference: 6,
    },
  },
};

const trainingCaveCurveOptions: IGamePolygonGeneratorOptions = {
  reference: {
    geometry: {
      canvasLength: 500,
      samplesPerFrame: 700,
      amplitude: 60,
      baselineY: 150,
      periodsAcrossFrame: 2,
    },
    noise: {
      noiseWindowSize: 28,
      profileSmoothingPasses: 3,
      spikeSuppressionFactor: 1.15,
    },
  },
  upper: {
    geometry: {
      canvasLength: 500,
      amplitude: 70,
    },
    distribution: {
      interval: { min: 14, max: 30 },
      skew: 0.08,
      variationInfluence: 3,
    },
    noise: {
      noiseAmplifier: 10,
    },
    limits: {
      minDistanceFromReference: 62,
    },
  },
  lower: {
    geometry: {
      canvasLength: 500,
      amplitude: 0.000001,
    },
    distribution: {
      interval: { min: 3, max: 7 },
      skew: -0.02,
      variationInfluence: 0.45,
    },
    noise: {
      noiseAmplifier: 0.32,
    },
    shape: {
      flattenStrength: 1,
      flattenPeriodScale: 0.08,
    },
    limits: {
      minDistanceFromReference: 62,
      maxOffsetFromReference: 5,
    },
  },
};
