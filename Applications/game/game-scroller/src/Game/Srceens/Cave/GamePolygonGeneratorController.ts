import type { Point2 } from '@monorepo/core-math';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { CurveOptionsBuilder } from './CurveOptionsBuilder.js';
import type { IGamePolygonGeneratorOptions, INormalizedGeneratorOptions } from './CurveOptions.js';
import {
  UpperCurveBandStrategy,
  buildPoints,
  createProjectionContext
} from './strategies/CurveBandStrategy.js';
import { LowerCurveLineStrategy } from './strategies/LowerCurveLineStrategy.js';
import { CaveReferenceCurveStrategy } from './strategies/ReferenceCurveStrategy.js';
import { SkewNormalVariationStrategy } from './strategies/SkewNormalVariationStrategy.js';

export { type IGamePolygonGeneratorOptions } from './CurveOptions.js';

interface IGeneratorState {
  phase: number;
  referencePoints: Point2[];
  upperPoints: Point2[];
  lowerPoints: Point2[];
}

export class GamePolygonGeneratorController implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  readonly #config: INormalizedGeneratorOptions;
  readonly #referenceStrategy = new CaveReferenceCurveStrategy();
  readonly #upperVariationStrategy = new SkewNormalVariationStrategy(1);
  readonly #lowerLineStrategy = new LowerCurveLineStrategy(10, {
    slowPeriodsAcrossFrame: 1,
    waveAmplitude: 1.8,
    referenceInfluence: 0.05
  });

  readonly #state: IGeneratorState = {
    phase: 0,
    referencePoints: [],
    upperPoints: [],
    lowerPoints: []
  };

  public constructor(host: ReactiveControllerHost, options: IGamePolygonGeneratorOptions) {
    this.#host = host;
    this.#config = new CurveOptionsBuilder().build(options);

    this.#host.addController(this);
    this.#regenerate();
  }

  public get referencePoints(): readonly Point2[] {
    return this.#state.referencePoints.map(copyPoint);
  }

  public get upperPoints(): readonly Point2[] {
    return this.#state.upperPoints.map(copyPoint);
  }

  public get lowerPoints(): readonly Point2[] {
    return this.#state.lowerPoints.map(copyPoint);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public setPhase(phase: number): void {
    if (phase === this.#state.phase) return;
    this.#state.phase = phase;
    this.#regenerate();
    this.#host.requestUpdate();
  }

  #regenerate(): void {
    const frameLength = this.#config.frame.canvasLength * 3;
    const sampleCount = this.#config.frame.samplesPerFrame;

    const referencePoints = buildPoints({
      frameLength,
      sampleCount,
      yAt: ({ normalizedX }) =>
        this.#referenceStrategy.yAt(normalizedX, this.#state.phase, this.#config.reference)
    });

    const upperVariation = this.#upperVariationStrategy.create(this.#config.upper, sampleCount);

    const upperBand = new UpperCurveBandStrategy({
      minDistanceFromReference: this.#config.upper.limits.minDistanceFromReference
    });
    const upperPoints = referencePoints.map((point, index) => {
      return {
        x: point.x,
        y: upperBand.project(
          createProjectionContext({
            point,
            index,
            frameLength,
            variation: upperVariation
          })
        )
      };
    });

    this.#lowerLineStrategy.setReference(
      referencePoints,
      this.#config.lower.limits.minDistanceFromReference
    );

    const lowerPoints = referencePoints.map((point) => {
      return {
        x: point.x,
        y: this.#lowerLineStrategy.yAt(point)
      };
    });

    this.#state.referencePoints = referencePoints;
    this.#state.upperPoints = upperPoints;
    this.#state.lowerPoints = lowerPoints;
  }
}

function copyPoint(point: Point2): Point2 {
  return { x: point.x, y: point.y };
}
