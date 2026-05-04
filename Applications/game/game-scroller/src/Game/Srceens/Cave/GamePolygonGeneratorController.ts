import type { Point2 } from '@monorepo/core-math';
import {
  EstimateRange,
  EstimateShape,
  Mulberry32RandomSource,
  SkewNormalEstimateDistribution
} from '@monorepo/core-math-probability';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

export class GamePolygonGeneratorController implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  readonly #canvasLength: number;
  readonly #amplitude: number;
  readonly #periodsAcrossFrame: number;
  readonly #baselineY: number;
  readonly #samplesPerFrame: number;
  readonly #upperInterval: { min: number; max: number };
  readonly #lowerInterval: { min: number; max: number };
  readonly #upperVariationInfluence: number;
  readonly #lowerVariationInfluence: number;
  readonly #maxOffsetFromReference: number;
  readonly #upperShape: EstimateShape;
  readonly #lowerShape: EstimateShape;
  readonly #noiseWindowSize: number;
  readonly #upperNoiseAmplifier: number;
  readonly #lowerNoiseAmplifier: number;

  #phase = 0;
  #referencePoints: Point2[] = [];
  #upperPoints: Point2[] = [];
  #lowerPoints: Point2[] = [];
  #upperOffsetProfile: number[] = [];
  #lowerOffsetProfile: number[] = [];
  #upperShapeProfile: number[] = [];
  #lowerShapeProfile: number[] = [];

  public constructor(
    host: ReactiveControllerHost,
    options: {
      canvasLength: number;
      amplitude: number;
      periodsAcrossFrame?: number;
      baselineY?: number;
      samplesPerFrame?: number;
      upperInterval?: { min: number; max: number };
      lowerInterval?: { min: number; max: number };
      variationInfluence?: number;
      upperVariationInfluence?: number;
      lowerVariationInfluence?: number;
      maxOffsetFromReference?: number;
      upperSkew?: number;
      lowerSkew?: number;
      noiseWindowSize?: number;
      noiseAmplifier?: number;
      upperNoiseAmplifier?: number;
      lowerNoiseAmplifier?: number;
    }
  ) {
    this.#host = host;
    this.#canvasLength = options.canvasLength;
    this.#amplitude = options.amplitude;
    this.#periodsAcrossFrame = options.periodsAcrossFrame ?? 4;
    this.#baselineY = options.baselineY ?? 150;
    this.#samplesPerFrame = options.samplesPerFrame ?? 1200;
    this.#upperInterval = options.upperInterval ?? { min: 14, max: 28 };
    this.#lowerInterval = options.lowerInterval ?? { min: 14, max: 28 };
    const fallbackInfluence = options.variationInfluence ?? 1;
    this.#upperVariationInfluence = options.upperVariationInfluence ?? fallbackInfluence;
    this.#lowerVariationInfluence = options.lowerVariationInfluence ?? fallbackInfluence;
    this.#maxOffsetFromReference = options.maxOffsetFromReference ?? 140;
    this.#upperShape = new EstimateShape(0.6, options.upperSkew ?? 0.5, 1);
    this.#lowerShape = new EstimateShape(0.8, options.lowerSkew ?? -0.15, 1.6);
    this.#noiseWindowSize = options.noiseWindowSize ?? 24;
    const fallbackNoiseAmplifier = options.noiseAmplifier ?? 3;
    this.#upperNoiseAmplifier = options.upperNoiseAmplifier ?? fallbackNoiseAmplifier;
    this.#lowerNoiseAmplifier = options.lowerNoiseAmplifier ?? fallbackNoiseAmplifier;

    this.#host.addController(this);
    this.#initializeOffsetProfiles();
    this.#regenerate();
  }

  public get referencePoints(): readonly Point2[] {
    return this.#referencePoints.map((point) => ({ x: point.x, y: point.y }));
  }

  public get upperPoints(): readonly Point2[] {
    return this.#upperPoints.map((point) => ({ x: point.x, y: point.y }));
  }

  public get lowerPoints(): readonly Point2[] {
    return this.#lowerPoints.map((point) => ({ x: point.x, y: point.y }));
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public setPhase(phase: number): void {
    if (phase === this.#phase) return;
    this.#phase = phase;
    this.#regenerate();
    this.#host.requestUpdate();
  }

  #initializeOffsetProfiles(): void {
    const random = new Mulberry32RandomSource(12345);
    const upperDist = new SkewNormalEstimateDistribution(
      new EstimateRange(this.#upperInterval.min, (this.#upperInterval.min + this.#upperInterval.max) / 2, this.#upperInterval.max),
      this.#upperShape
    );
    const lowerDist = new SkewNormalEstimateDistribution(
      new EstimateRange(this.#lowerInterval.min, (this.#lowerInterval.min + this.#lowerInterval.max) / 2, this.#lowerInterval.max),
      this.#lowerShape
    );

    const upperRaw: number[] = [];
    const lowerRaw: number[] = [];
    const upperShapeRaw: number[] = [];
    const lowerShapeRaw: number[] = [];
    const upper: number[] = [];
    const lower: number[] = [];
    const upperShape: number[] = [];
    const lowerShape: number[] = [];
    const upperCenter = (this.#upperInterval.min + this.#upperInterval.max) / 2;
    const lowerCenter = (this.#lowerInterval.min + this.#lowerInterval.max) / 2;

    for (let i = 0; i <= this.#samplesPerFrame; i += 1) {
      upperRaw.push(Math.abs(upperDist.sample(random)));
      lowerRaw.push(Math.abs(lowerDist.sample(random)));
      upperShapeRaw.push(upperDist.sample(random));
      lowerShapeRaw.push(lowerDist.sample(random));
    }

    for (let i = 0; i <= this.#samplesPerFrame; i += 1) {
      const upperAvg = movingAverageBackward(upperRaw, i, this.#noiseWindowSize);
      const lowerAvg = movingAverageBackward(lowerRaw, i, this.#noiseWindowSize);

      const upperOffset = Math.min(upperAvg * this.#upperVariationInfluence, this.#maxOffsetFromReference);
      const lowerOffset = Math.min(lowerAvg * this.#lowerVariationInfluence, this.#maxOffsetFromReference);
      const upperShapeAvg = movingAverageBackward(upperShapeRaw, i, this.#noiseWindowSize);
      const lowerShapeAvg = movingAverageBackward(lowerShapeRaw, i, this.#noiseWindowSize);
      const upperLocalShape = (upperShapeAvg - upperCenter) * 0.35 * this.#upperNoiseAmplifier;
      const lowerLocalShape = (lowerShapeAvg - lowerCenter) * 0.35 * this.#lowerNoiseAmplifier;

      // Keep upper/lower independent and non-mirrored by using separate distributions
      // and separate moving-average histories.
      upper.push(upperOffset);
      lower.push(lowerOffset);
      upperShape.push(upperLocalShape);
      lowerShape.push(lowerLocalShape);
    }

    this.#upperOffsetProfile = upper;
    this.#lowerOffsetProfile = lower;
    this.#upperShapeProfile = upperShape;
    this.#lowerShapeProfile = lowerShape;
  }

  #regenerate(): void {
    const frameLength = this.#canvasLength * 3;
    const dx = frameLength / this.#samplesPerFrame;

    const ref: Point2[] = [];
    const upper: Point2[] = [];
    const lower: Point2[] = [];

    for (let i = 0; i <= this.#samplesPerFrame; i += 1) {
      const x = dx * i;
      const normalizedX = x / frameLength;
      const t = 2 * Math.PI * this.#periodsAcrossFrame * normalizedX + this.#phase;
      const y = this.#baselineY + this.#amplitude * Math.sin(t);
      const upperNoise = this.#upperOffsetProfile[i] ?? this.#upperInterval.min;
      const lowerNoise = this.#lowerOffsetProfile[i] ?? this.#lowerInterval.min;
      const upperShape = this.#upperShapeProfile[i] ?? 0;
      const lowerShape = this.#lowerShapeProfile[i] ?? 0;
      const upperY = Math.min(y - upperNoise + upperShape, y - 1);
      const lowerY = Math.max(y + lowerNoise + lowerShape, y + 1);

      ref.push({ x, y });
      upper.push({ x, y: upperY });
      lower.push({ x, y: lowerY });
    }

    this.#referencePoints = ref;
    this.#upperPoints = upper;
    this.#lowerPoints = lower;
  }
}

function movingAverageBackward(values: readonly number[], index: number, windowSize: number): number {
  const start = Math.max(0, index - windowSize + 1);
  let sum = 0;
  let count = 0;

  for (let i = start; i <= index; i += 1) {
    sum += values[i] ?? 0;
    count += 1;
  }

  return count > 0 ? sum / count : 0;
}
