// =====================================================================================
// FILE: tests/numerics/ErrorFunction.spec.ts
// =====================================================================================

import { describe, expect, it } from "vitest";
import { ErrorFunction } from "../src/index.js";

describe("ErrorFunction", () => {
  it("should return zero for erf(0)", () => {
    expect(ErrorFunction.erf(0)).toBeCloseTo(0, 12);
  });

  it("should be odd", () => {
    const x = 1.2;
    expect(ErrorFunction.erf(-x)).toBeCloseTo(-ErrorFunction.erf(x), 12);
  });

  it("should approach one for large positive values", () => {
    expect(ErrorFunction.erf(4)).toBeCloseTo(1, 4);
  });
});

