
// ============================================================================
// FILE: packages/core-math-box/tests/Box2.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { BoxFixture } from "./fixtures/BoxFixture.js";

describe("Box2", () => {
  const fixture = new BoxFixture();

  it("should expose four vertices and four edges", () => {
    const sut = fixture.createUnitBox2AtOrigin();

    const vertices = sut.getVertices();
    const edges = sut.getEdges();

    expect(vertices).toHaveLength(4);
    expect(edges).toHaveLength(4);
  });

  it("should calculate width, height, area, perimeter and center", () => {
    const sut = fixture.createUnitBox2AtOrigin();

    expect(sut.width()).toBeCloseTo(2);
    expect(sut.height()).toBeCloseTo(1);
    expect(sut.area()).toBeCloseTo(2);
    expect(sut.perimeter()).toBeCloseTo(6);
    expect(sut.center().equals(new Vector2Gpu(1, 0.5))).toBe(true);
  });

  it("should return two normalized box axes", () => {
    const sut = fixture.createUnitBox2AtOrigin();

    const axes = sut.getAxes();

    expect(axes).toHaveLength(2);
    expect(axes[0].length()).toBeCloseTo(1);
    expect(axes[1].length()).toBeCloseTo(1);
    expect(Math.abs(axes[0].dot(axes[1]))).toBeLessThanOrEqual(1e-6);
  });

  it("should contain a point inside the box", () => {
    const sut = fixture.createUnitBox2AtOrigin();

    const result = sut.contains(new Vector2Gpu(1, 0.25));

    expect(result).toBe(true);
  });

  it("should not contain a point outside the box", () => {
    const sut = fixture.createUnitBox2AtOrigin();

    const result = sut.contains(new Vector2Gpu(3, 0.25));

    expect(result).toBe(false);
  });

  it("should reject non-orthogonal vertices", () => {
    const act = () =>
      fixture["createBox2Collision"]() &&
      fixture["createUnitBox2AtOrigin"]() &&
      new (fixture.createUnitBox2AtOrigin().constructor as typeof import("../src/code.js").Box2)(
        new Vector2Gpu(0, 0),
        new Vector2Gpu(2, 0),
        new Vector2Gpu(3, 1),
        new Vector2Gpu(0, 1),
      );

    expect(act).toThrowError("Box2 adjacent edges must be orthogonal.");
  });

  it("should reject zero-length edges", () => {
    const act = () =>
      new (fixture.createUnitBox2AtOrigin().constructor as typeof import("../src/code.js").Box2)(
        new Vector2Gpu(0, 0),
        new Vector2Gpu(0, 0),
        new Vector2Gpu(1, 1),
        new Vector2Gpu(0, 1),
      );

    expect(act).toThrowError("edge AB must be greater than zero.");
  });
});
