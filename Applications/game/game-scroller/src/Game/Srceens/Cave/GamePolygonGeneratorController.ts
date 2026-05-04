import type { Point2 } from '@monorepo/core-math';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { CurveOptionsBuilder } from './CurveOptionsBuilder.js';
import type { IGamePolygonGeneratorOptions, INormalizedGeneratorOptions } from './CurveOptions.js';
import {
  LowerCurveBandStrategy,
  UpperCurveBandStrategy,
  buildPoints,
  createProjectionContext
} from './strategies/CurveBandStrategy.js';
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
  readonly #lowerVariationStrategy = new SkewNormalVariationStrategy(1.6);

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
    const lowerVariation = this.#lowerVariationStrategy.create(this.#config.lower, sampleCount);

    const upperBand = new UpperCurveBandStrategy();
    const lowerBand = new LowerCurveBandStrategy({
      baselineY: this.#config.reference.geometry.baselineY,
      periodsAcrossFrame: this.#config.reference.geometry.periodsAcrossFrame,
      flattenStrength: this.#config.lower.shape.flattenStrength,
      flattenPeriodScale: this.#config.lower.shape.flattenPeriodScale
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

    const lowerPoints = referencePoints.map((point, index) => {
      return {
        x: point.x,
        y: lowerBand.project(
          createProjectionContext({
            point,
            index,
            frameLength,
            variation: lowerVariation
          })
        )
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
