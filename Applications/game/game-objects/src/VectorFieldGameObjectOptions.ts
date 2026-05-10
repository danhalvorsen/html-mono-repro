import type { VectorFieldBounds } from './VectorField/VectorFieldTypes.js';

export interface VectorFieldNoiseOptions {
  readonly scale: number;
  readonly timeScale: number;
  readonly derivativeStep: number;
}

export interface VectorFieldPathOptions {
  readonly stepLength: number;
  readonly steps: number;
}

export interface VectorFieldStrokeOptions {
  readonly foreground: string;
  readonly shadow: string;
  readonly background: string;
  readonly foregroundOpacity: number;
  readonly shadowOpacity: number;
  readonly shadowEvery: number;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly blurStdDeviation: number;
}

export interface VectorFieldGameObjectOptions {
  readonly bounds: VectorFieldBounds;
  readonly seed: number;
  readonly lineCount: number;
  readonly maxSeedCount: number;
  readonly animationSpeed: number;
  readonly noise: VectorFieldNoiseOptions;
  readonly path: VectorFieldPathOptions;
  readonly stroke: VectorFieldStrokeOptions;
}

export const DefaultVectorFieldGameObjectOptions: VectorFieldGameObjectOptions = {
  bounds: {
    width: 1500,
    height: 300,
  },
  seed: 92831,
  lineCount: 280,
  maxSeedCount: 340,
  animationSpeed: 1,
  noise: {
    scale: 0.0045,
    timeScale: 0.12,
    derivativeStep: 0.03,
  },
  path: {
    stepLength: 4.5,
    steps: 90,
  },
  stroke: {
    foreground: '#ffffff',
    shadow: '#111111',
    background: '#000000',
    foregroundOpacity: 0.96,
    shadowOpacity: 0.9,
    shadowEvery: 6,
    minWidth: 4,
    maxWidth: 10,
    blurStdDeviation: 0.45,
  },
} as const;