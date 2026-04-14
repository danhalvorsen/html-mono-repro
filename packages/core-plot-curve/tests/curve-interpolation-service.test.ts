import { describe, expect, it } from "vitest";

import { InterpolatedCurve } from "../src/domain/interpolated-curve.js";
import { CurveInterpolationService } from "../src/services/curve-interpolation-service.js";

describe("CurveInterpolationService", () => {
  it("samples a deterministic catmull-rom curve", () => {
    const service = new CurveInterpolationService();
    const curve = new InterpolatedCurve(
      [
        { x: -7, y: -3 },
        { x: -2, y: 5 },
        { x: 3, y: 2 },
        { x: 8, y: 7 },
      ],
      "g",
    );

    const first = service.sample(curve);
    const second = service.sample(curve);

    expect(first).toHaveLength(second.length);
    expect(first[0]?.x).toBeCloseTo(second[0]?.x ?? 0, 6);
    expect(first[Math.floor(first.length / 2)]?.y).toBeCloseTo(
      second[Math.floor(second.length / 2)]?.y ?? 0,
      6,
    );
    expect(first.at(-1)?.x).toBeCloseTo(second.at(-1)?.x ?? 0, 6);
  });

  it("returns no samples for insufficient input", () => {
    const service = new CurveInterpolationService();
    const curve = new InterpolatedCurve(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
      ],
      "short",
    );

    expect(service.sample(curve)).toHaveLength(0);
  });
});
