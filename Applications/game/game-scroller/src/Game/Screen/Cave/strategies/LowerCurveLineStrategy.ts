import type { Point2 } from '@monorepo/core-math';
import { Axis } from '../../../CoordinateSystem/Axis.js';
import { Interval } from '../../../CoordinateSystem/Interval.js';
import {
  CartesianCoordinateSystem,
  SvgCartesianCoordinateMapper
} from '../../../CoordinateSystem/Mapper.js';

export interface ILowerCurveLineStrategy {
  yAt(point: Point2): number;
  setReference(referencePoints: readonly Point2[], margin: number): void;
}

export class LowerCurveLineStrategy implements ILowerCurveLineStrategy {
  readonly #y: number;
  #resolvedY: number;
  readonly #referenceAxis = new Axis(new Interval(0, 0));
  readonly #mapper = new SvgCartesianCoordinateMapper();
  #minX = 0;
  #maxX = 1;
  #referenceMidY = 0;
  #margin = 0;

  readonly #slowPeriodsAcrossFrame: number;
  readonly #waveAmplitude: number;
  readonly #referenceInfluence: number;

  public constructor(
    y: number = 10,
    options: {
      readonly slowPeriodsAcrossFrame?: number;
      readonly waveAmplitude?: number;
      readonly referenceInfluence?: number;
    } = {}
  ) {
    this.#y = y;
    this.#resolvedY = y;
    this.#slowPeriodsAcrossFrame = options.slowPeriodsAcrossFrame ?? 1;
    this.#waveAmplitude = options.waveAmplitude ?? 2;
    this.#referenceInfluence = options.referenceInfluence ?? 0.06;
  }

  public setReference(referencePoints: readonly Point2[], margin: number): void {
    if (referencePoints.length === 0) {
      this.#resolvedY = this.#y;
      return;
    }

    const xs = referencePoints.map(point => point.x);
    const ys = referencePoints.map(point => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    this.#minX = minX;
    this.#maxX = maxX;
    this.#margin = margin;
    this.#referenceMidY = (minY + maxY) / 2;
    const svgCoordinateSystem = new CartesianCoordinateSystem({
      xaxis: new Axis(new Interval(minX, maxX)),
      yaxis: new Axis(new Interval(minY, maxY))
    });
    const cartesianCoordinateSystem = this.#mapper.map({
      coordinateSystem: svgCoordinateSystem
    });

    const svgYInterval = svgCoordinateSystem.yaxis.getInterval();
    const cartesianYInterval = cartesianCoordinateSystem.yaxis.getInterval();

    const lowestReferenceCartesianY = Math.min(
      ...referencePoints.map(point =>
        this.#mapValue(point.y, svgYInterval, cartesianYInterval)
      )
    );
    const targetLowerCartesianY = lowestReferenceCartesianY - margin;
    const resolvedSvgY = this.#mapValue(
      targetLowerCartesianY,
      cartesianYInterval,
      svgYInterval
    );

    this.#referenceAxis.setInterval(new Interval(minY, maxY));
    const lowestReferenceY = this.#referenceAxis.getInterval().max;
    this.#resolvedY = Math.max(resolvedSvgY, lowestReferenceY + margin);
  }

  public yAt(point: Point2): number {
    const xSpan = this.#maxX - this.#minX;
    const normalizedX = xSpan > 0 ? (point.x - this.#minX) / xSpan : 0;
    const slowWave = Math.sin(2 * Math.PI * this.#slowPeriodsAcrossFrame * normalizedX);
    const referenceDriven = (point.y - this.#referenceMidY) * this.#referenceInfluence;
    const candidate = this.#resolvedY + this.#waveAmplitude * slowWave + referenceDriven;
    return Math.max(candidate, point.y + this.#margin);
  }

  #mapValue(
    value: number,
    source: { min: number; max: number },
    target: { min: number; max: number }
  ): number {
    if (source.max === source.min) {
      return target.min;
    }

    const ratio = (value - source.min) / (source.max - source.min);
    return target.min + ratio * (target.max - target.min);
  }
}
