
// ============================================================================
// FILE: packages/core-math-box/tests/Aabb3.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Vector3Gpu } from "@monorepo/core-math-gpu";
import { BoxFixture } from "./fixtures/BoxFixture.js";
describe("Aabb3", () => {
  const fixture = new BoxFixture();

  it("should expose min and max", () => {
    const sut = fixture.createAabb3(1, 2, 3, 5, 7, 11);

    expect(sut.min().equals(new Vector3Gpu(1, 2, 3))).toBe(true);
    expect(sut.max().equals(new Vector3Gpu(5, 7, 11))).toBe(true);
  });

  it("should calculate dimensions and volume", () => {
    const sut = fixture.createAabb3(1, 2, 3, 5, 7, 11);

    expect(sut.width()).toBeCloseTo(4);
    expect(sut.height()).toBeCloseTo(5);
    expect(sut.depth()).toBeCloseTo(8);
    expect(sut.volume()).toBeCloseTo(160);
    expect(sut.center().equals(new Vector3Gpu(3, 4.5, 7))).toBe(true);
  });

  it("should reject invalid bounds", () => {
    const act = () => fixture.createAabb3(5, 2, 3, 1, 7, 11);

    expect(act).toThrowError("Aabb3 max must be greater than or equal to min.");
  });

  it("should reject zero sized bounds", () => {
    const act = () => fixture.createAabb3(1, 2, 3, 1, 7, 11);

    expect(act).toThrowError("Aabb3 dimensions must be greater than zero.");
  });
});

