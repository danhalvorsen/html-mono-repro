import { CatmullRomSpline3D, Vector2, Vector3 } from "@monorepo/core-math";

import { InterpolatedCurve } from "../domain/interpolated-curve.js";

export class CurveInterpolationService {
  public sample(curve: InterpolatedCurve): readonly Vector2[] {
    if (curve.points.length < 4) {
      return [];
    }

    const source = curve.points.map((point) => new Vector3(point.x, point.y, 0));
    const firstPoint = source.at(0);
    const lastPoint = source.at(-1);
    if (firstPoint === undefined || lastPoint === undefined) {
      return [];
    }

    switch (curve.interpolationKind) {
      case "catmull-rom":
        return this.sampleCatmullRom(source, firstPoint, lastPoint, curve.stepsPerSegment);
      default:
        return [];
    }
  }

  private sampleCatmullRom(
    source: readonly Vector3[],
    firstPoint: Vector3,
    lastPoint: Vector3,
    stepsPerSegment: number,
  ): readonly Vector2[] {
    const padded = [
      firstPoint.clone(),
      ...source.map((point) => point.clone()),
      lastPoint.clone(),
    ];
    const spline = new CatmullRomSpline3D(padded);
    const totalSteps = Math.max(1, (source.length - 1) * stepsPerSegment);
    const samples: Vector2[] = [];

    for (let index = 0; index <= totalSteps; index += 1) {
      const t = index / totalSteps;
      const sample = spline.getPointAt(t);
      samples.push(new Vector2(sample.x, sample.y));
    }

    return samples;
  }
}
