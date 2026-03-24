import { OneSampleZTest, PercentileService, Probability, Sample, TailKind } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("PercentileService", () => {
  const sut = new PercentileService();

  it("should return the median for p50", () => {
    const sample = new Sample([1, 2, 3, 4, 5]);

    expect(sut.percentile(sample, Probability.create(0.5))).toBe(3);
  });

  it("should interpolate when percentile falls between two points", () => {
    const sample = new Sample([10, 20, 30, 40]);

    expect(sut.percentile(sample, Probability.create(0.5))).toBe(25);
  });

  it("should return the only value for a single-value sample", () => {
    const sample = new Sample([42]);

    expect(sut.percentile(sample, Probability.create(0.9))).toBe(42);
  });
});
