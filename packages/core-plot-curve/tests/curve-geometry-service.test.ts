import { describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { CurveGeometryService } from "../src/services/curve-geometry-service.js";

describe("CurveGeometryService", () => {
  const service = new CurveGeometryService();
  const samples = [
    new Vector2(-7, -3),
    new Vector2(-2, 5),
    new Vector2(3, 2),
    new Vector2(8, 7),
  ] as const;

  it("returns null for pointAt on empty input", () => {
    expect(service.pointAt([], 0.5)).toBeNull();
  });

  it("returns the only point for pointAt on single-point input", () => {
    const point = new Vector2(4, 6);

    expect(service.pointAt([point], 0.5)).toBe(point);
  });

  it("provides deterministic curve operations", () => {
    const firstPoint = service.pointAt(samples, 0.5);
    const secondPoint = service.pointAt(samples, 0.5);
    const tangent = service.tangentAt(samples, 0.5);
    const normal = service.normalAt(samples, 0.5);
    const length = service.length(samples);

    expect(firstPoint).not.toBeNull();
    expect(secondPoint).not.toBeNull();
    expect(firstPoint?.x).toBeCloseTo(secondPoint?.x ?? 0, 6);
    expect(firstPoint?.y).toBeCloseTo(secondPoint?.y ?? 0, 6);
    expect(tangent).not.toBeNull();
    expect(normal).not.toBeNull();
    expect(length).toBeGreaterThan(0);
    expect(tangent?.length()).toBeCloseTo(1, 4);
    expect(normal?.length()).toBeCloseTo(1, 4);
  });

  it("returns null tangent and normal when insufficient points are provided", () => {
    const point = new Vector2(1, 2);

    expect(service.tangentAt([point], 0.5)).toBeNull();
    expect(service.normalAt([point], 0.5)).toBeNull();
  });
});
