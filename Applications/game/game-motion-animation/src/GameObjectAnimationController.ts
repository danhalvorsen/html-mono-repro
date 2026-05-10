import type { Point2 } from '@monorepo/core-math';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

type ReferenceCurveProvider = {
  getGeneratedCurves(): {
    readonly reference: readonly Point2[];
  };
};

type AnimationHost = ReactiveControllerHost & {
  caveGameObject?: ReferenceCurveProvider;
};

/**
 * The GameObjectAnimationController is responsible for traversing a dataset of positions
 * when the scheduler ticks `onTime`.
 * Rotation is calculated from curve derivation by using n-1 and n+1 samples.
 */
export class GameObjectAnimationController implements ReactiveController {
  readonly #host: AnimationHost;
  readonly #onFrame: ((args: {
    readonly time: number;
    readonly index: number;
    readonly point: Point2;
    readonly rotationRadians: number;
  }) => void) | null;
  #fallbackSamples: readonly Point2[];
  #loop: boolean;
  #index = 0;
  #direction: 1 | -1 = 1;
  #indexOffsetRatio: number;
  #isOffsetInitialized = false;
  #currentPoint: Point2 | null = null;
  #currentRotationRadians = 0;

  public constructor(options: {
    readonly host: AnimationHost;
    readonly samples?: readonly Point2[];
    readonly onFrame?: (args: {
      readonly time: number;
      readonly index: number;
      readonly point: Point2;
      readonly rotationRadians: number;
    }) => void;
    readonly loop?: boolean;
    readonly indexOffsetRatio?: number;
  }) {
    this.#host = options.host;
    this.#fallbackSamples = options.samples ?? [];
    this.#onFrame = options.onFrame ?? null;
    this.#loop = options.loop ?? false;
    this.#indexOffsetRatio = this.#normalizeOffsetRatio(options.indexOffsetRatio ?? 0);
    this.#host.addController(this);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public setSamples(samples: readonly Point2[]): void {
    this.#fallbackSamples = samples;
    this.reset();
  }

  public setLoop(loop: boolean): void {
    this.#loop = loop;
  }

  public setIndexOffsetRatio(indexOffsetRatio: number): void {
    this.#indexOffsetRatio = this.#normalizeOffsetRatio(indexOffsetRatio);
    this.#isOffsetInitialized = false;
  }

  public reset(): void {
    this.#index = 0;
    this.#direction = 1;
    this.#isOffsetInitialized = false;
    this.#currentPoint = null;
    this.#currentRotationRadians = 0;
  }

  public getCurrentPoint(): Point2 | null {
    return this.#currentPoint;
  }

  public getCurrentRotationRadians(): number {
    return this.#currentRotationRadians;
  }

  public onTime(time: number): void {
    const samples = this.#resolveSamples();
    if (samples.length === 0) return;
    this.#initializeOffsetIfNeeded(samples);

    const currentIndex = this.#index;
    const currentPoint = samples[currentIndex] ?? samples[samples.length - 1];
    const rotation = this.#deriveRotation({
      index: currentIndex,
      samples
    });
    const point = { x: currentPoint!.x, y: currentPoint!.y };

    this.#currentPoint = point;
    this.#currentRotationRadians = rotation;
    this.#onFrame?.({
      time,
      index: currentIndex,
      point,
      rotationRadians: rotation
    });
    this.#host.requestUpdate();
    this.#index = this.#nextIndex({
      currentIndex,
      samplesLength: samples.length
    });
  }

  #nextIndex(options: { currentIndex: number; samplesLength: number }): number {
    const lastIndex = options.samplesLength - 1;
    if (lastIndex <= 0) return 0;

    if (this.#loop) {
      if (options.currentIndex < lastIndex) return options.currentIndex + 1;
      return 0;
    }

    const candidateIndex = options.currentIndex + this.#direction;
    if (candidateIndex > lastIndex) {
      this.#direction = -1;
      return Math.max(0, lastIndex - 1);
    }
    if (candidateIndex < 0) {
      this.#direction = 1;
      return Math.min(lastIndex, 1);
    }
    return candidateIndex;
  }

  #deriveRotation(options: { index: number; samples: readonly Point2[] }): number {
    const lastIndex = options.samples.length - 1;
    const previousIndex = Math.max(0, options.index - 1);
    const nextIndex = Math.min(lastIndex, options.index + 1);
    const previousPoint = options.samples[previousIndex] ?? options.samples[0];
    const nextPoint = options.samples[nextIndex] ?? options.samples[lastIndex];
    const baseRotation = Math.atan2(nextPoint!.y - previousPoint!.y, nextPoint!.x - previousPoint!.x);

    return this.#direction === 1 ? baseRotation : baseRotation + Math.PI;
  }

  #resolveSamples(): readonly Point2[] {
    const referenceCurve = this.#host.caveGameObject?.getGeneratedCurves().reference;
    if (referenceCurve && referenceCurve.length > 0) return referenceCurve;
    return this.#fallbackSamples;
  }

  #initializeOffsetIfNeeded(samples: readonly Point2[]): void {
    if (this.#isOffsetInitialized) return;
    const lastIndex = samples.length - 1;
    if (lastIndex <= 0) {
      this.#index = 0;
      this.#isOffsetInitialized = true;
      return;
    }

    this.#index = Math.round(lastIndex * this.#indexOffsetRatio);
    this.#isOffsetInitialized = true;
  }

  #normalizeOffsetRatio(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.min(1, Math.max(0, value));
  }
}
