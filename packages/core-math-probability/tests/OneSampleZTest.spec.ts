// =====================================================================================
// FILE: tests/testing/OneSampleZTest.spec.ts
// =====================================================================================
import { OneSampleZTest, Probability, TailKind } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("OneSampleZTest", () => {
  const sut = new OneSampleZTest();

  it("should reject a clearly shifted right-tailed sample", () => {
    const result = sut.test(
      108,
      100,
      10,
      64,
      Probability.create(0.05),
      TailKind.Right,
    );

    expect(result.statistic).toBeCloseTo(6.4, 6);
    expect(result.rejectNull).toBe(true);
    expect(result.pValue).toBeLessThan(0.05);
    expect(result.criticalValue).toBeGreaterThan(0);
  });

  it("should reject invalid sample size", () => {
    expect(() =>
      sut.test(1, 0, 1, 0, Probability.create(0.05), TailKind.Right),
    ).toThrowError(RangeError);
  });

  it("should reject non-positive population standard deviation", () => {
    expect(() =>
      sut.test(1, 0, 0, 10, Probability.create(0.05), TailKind.Right),
    ).toThrowError(RangeError);
  });
});
