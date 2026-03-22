// packages/core-math-colors/src/interpolation/GradientStopInterpolator.ts

import { Color } from "../colors/Color.js";
import { Gradient } from "../gradients/Gradient.js";
import { GradientStop } from "../gradients/GradientStop.js";
import type { IRangeBehavior } from "../range/IRangeBehavior.js";
import type { IColorInterpolationSpace } from "./IColorInterpolationSpace.js";
import type { IColorInterpolator } from "./IColorInterpolator.js";

export class GradientStopInterpolator implements IColorInterpolator {
  private static readonly EPSILON = 1e-12;

  private readonly gradient: Gradient;
  private readonly rangeBehavior: IRangeBehavior;
  private readonly interpolationSpace: IColorInterpolationSpace;

  public constructor(
    gradient: Gradient,
    rangeBehavior: IRangeBehavior,
    interpolationSpace: IColorInterpolationSpace,
  ) {
    this.gradient = gradient;
    this.rangeBehavior = rangeBehavior;
    this.interpolationSpace = interpolationSpace;
  }

  public sample(position: number): Color {
    const normalized = this.rangeBehavior.normalize(position);

    if (this.gradient.count === 1) {
      return this.gradient.getAt(0).color;
    }

    const first = this.gradient.getAt(0);
    const last = this.gradient.getAt(this.gradient.count - 1);

    if (normalized <= first.position) {
      return first.color;
    }

    if (normalized >= last.position) {
      return last.color;
    }

    for (let index = 0; index < this.gradient.count - 1; index += 1) {
      const start = this.gradient.getAt(index);
      const end = this.gradient.getAt(index + 1);

      if (normalized >= start.position && normalized <= end.position) {
        return this.interpolateBetween(start, end, normalized);
      }
    }

    return last.color;
  }

  public sampleMany(positions: readonly number[]): readonly Color[] {
    return positions.map((position) => this.sample(position));
  }

  private interpolateBetween(start: GradientStop, end: GradientStop, position: number): Color {
    const range = end.position - start.position;

    if (range === 0) {
      return end.color;
    }

    const localAmount = this.stabilizeUnitInterval(
      (position - start.position) / range,
    );

    return this.interpolationSpace.interpolate(start.color, end.color, localAmount);
  }

  private stabilizeUnitInterval(value: number): number {
    if (Math.abs(value) <= GradientStopInterpolator.EPSILON) {
      return 0;
    }

    if (Math.abs(1 - value) <= GradientStopInterpolator.EPSILON) {
      return 1;
    }

    if (Math.abs(value - 0.5) <= GradientStopInterpolator.EPSILON) {
      return 0.5;
    }

    return value;
  }
}