
// =====================================================================================
// FILE: tests/testing/OneSampleTTest.spec.ts
// =====================================================================================

import { OneSampleTTest, Probability, TailKind } from "../src/index.js"
import { describe, expect, it } from "vitest";
 
describe("OneSampleTTest", () => {
  const sut = new OneSampleTTest();

  it("should compute a two-sided t-test result", () => {
    const result = sut.test(
      54,
      50,
      6,
      16,
      Probability.create(0.05),
      TailKind.TwoSided,
    );

    expect(result.degreesOfFreedom).toBe(15);
    expect(result.pValue).toBeLessThan(0.05);
    expect(result.rejectNull).toBe(true);
  });

  it("should reject sample size less than two", () => {
    expect(() =>
      sut.test(1, 0, 1, 1, Probability.create(0.05), TailKind.TwoSided),
    ).toThrowError(RangeError);
  });

  it("should reject non-positive sample standard deviation", () => {
    expect(() =>
      sut.test(1, 0, 0, 5, Probability.create(0.05), TailKind.TwoSided),
    ).toThrowError(RangeError);
  });
});

