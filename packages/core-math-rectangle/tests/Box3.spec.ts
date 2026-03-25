
// ============================================================================
// FILE: packages/core-math-box/tests/Box3.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Vector3Gpu } from "@monorepo/core-math-gpu";
import { BoxFixture } from "./fixtures/BoxFixture.js";
import { Box3 } from "../src/code.js";

describe("Box3", () => {
  const fixture = new BoxFixture();

  it("should expose eight vertices and twelve edges", () => {
    const sut = fixture.createAxisAlignedBox3();

    expect(sut.getVertices()).toHaveLength(8);
    expect(sut.getEdges()).toHaveLength(12);
  });

  it("should calculate width, height, depth, volume and center", () => {
    const sut = fixture.createAxisAlignedBox3(
      new Vector3Gpu(10, 20, 30),
      new Vector3Gpu(1, 2, 3),
    );

    expect(sut.width()).toBeCloseTo(2);
    expect(sut.height()).toBeCloseTo(4);
    expect(sut.depth()).toBeCloseTo(6);
    expect(sut.volume()).toBeCloseTo(48);
    expect(sut.center().equals(new Vector3Gpu(10, 20, 30))).toBe(true);
  });

  it("should contain a point inside the box", () => {
    const sut = fixture.createAxisAlignedBox3(
      new Vector3Gpu(0, 0, 0),
      new Vector3Gpu(1, 1, 1),
    );

    expect(sut.contains(new Vector3Gpu(0.5, 0.5, 0.5))).toBe(true);
  });

  it("should not contain a point outside the box", () => {
    const sut = fixture.createAxisAlignedBox3(
      new Vector3Gpu(0, 0, 0),
      new Vector3Gpu(1, 1, 1),
    );

    expect(sut.contains(new Vector3Gpu(5, 0, 0))).toBe(false);
  });

  it("should reject non-orthogonal axes", () => {
    const act = () =>
      new Box3(
        new Vector3Gpu(0, 0, 0),
        new Vector3Gpu(1, 1, 1),
        new Vector3Gpu(1, 0, 0),
        new Vector3Gpu(1, 0, 0),
        new Vector3Gpu(0, 0, 1),
      );

    expect(act).toThrowError("Box3 axisX and axisY must be orthogonal.");
  });

  it("should reject non-positive half size", () => {
    const act = () =>
      fixture.createAxisAlignedBox3(
        new Vector3Gpu(0, 0, 0),
        new Vector3Gpu(0, 1, 1),
      );

    expect(act).toThrowError("Box3 halfSize components must be greater than zero.");
  });
});
