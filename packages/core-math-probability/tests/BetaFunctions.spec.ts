
import { describe, expect, it } from "vitest";
import { BetaFunctions } from "../src/index.js";

describe("BetaFunctions", () => {
  it("should calculate beta(1,1) = 1", () => {
    expect(BetaFunctions.beta(1, 1)).toBeCloseTo(1, 10);
  });

  it("should calculate regularized incomplete beta at x=0 and x=1", () => {
    expect(BetaFunctions.regularizedIncompleteBeta(0, 2, 3)).toBe(0);
    expect(BetaFunctions.regularizedIncompleteBeta(1, 2, 3)).toBe(1);
  });

  it("should keep regularized incomplete beta in [0,1]", () => {
    const result = BetaFunctions.regularizedIncompleteBeta(0.5, 2, 3);

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it("should reject invalid beta arguments", () => {
    expect(() => BetaFunctions.beta(0, 1)).toThrowError(RangeError);
  });
});
