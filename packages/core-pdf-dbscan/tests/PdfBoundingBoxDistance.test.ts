import { describe, expect, it } from "vitest";

import { PdfBoundingBoxDistance } from "../src/PdfBoundingBoxDistance.js";
import { PdfBoundingBoxFixture } from "./fixtures/PdfBoundingBoxFixture.js";

const fixture = new PdfBoundingBoxFixture();

describe("PdfBoundingBoxDistance", () => {
  it("should return zero for overlapping boxes", () => {
    const sut = new PdfBoundingBoxDistance();
    const [left, right] = fixture.createOverlappingPair();

    expect(sut.measure(left, right)).toBe(0);
  });

  it("should return zero for touching boxes", () => {
    const sut = new PdfBoundingBoxDistance();
    const [left, right] = fixture.createTouchingPair();

    expect(sut.measure(left, right)).toBe(0);
  });

  it("should support degenerate boxes", () => {
    const sut = new PdfBoundingBoxDistance();
    const [left, right] = fixture.createDegeneratePair();

    expect(sut.measure(left, right)).toBe(5);
  });
});
