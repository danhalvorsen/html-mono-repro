import { describe, expect, it } from "vitest";

import { PdfBoundingBox } from "../src/PdfBoundingBox.js";

describe("PdfBoundingBox", () => {
  it("should expose normalized width and height from min and max coordinates", () => {
    const sut = new PdfBoundingBox("box-1", 10, 20, 30, 50);

    expect(sut.id).toBe("box-1");
    expect(sut.min.x).toBe(10);
    expect(sut.min.y).toBe(20);
    expect(sut.max.x).toBe(30);
    expect(sut.max.y).toBe(50);
    expect(sut.width).toBe(20);
    expect(sut.height).toBe(30);
  });

  it("should create a bounding box from origin and size", () => {
    const sut = PdfBoundingBox.fromBounds("box-1", 5, 6, 7, 8);

    expect(sut.min.x).toBe(5);
    expect(sut.min.y).toBe(6);
    expect(sut.max.x).toBe(12);
    expect(sut.max.y).toBe(14);
    expect(sut.width).toBe(7);
    expect(sut.height).toBe(8);
  });

  it("should allow degenerate width and height", () => {
    const sut = PdfBoundingBox.fromBounds("box-1", 0, 0, 0, 0);

    expect(sut.width).toBe(0);
    expect(sut.height).toBe(0);
    expect(sut.min.x).toBe(0);
    expect(sut.min.y).toBe(0);
    expect(sut.max.x).toBe(0);
    expect(sut.max.y).toBe(0);
  });

  it("should reject empty identifiers", () => {
    expect(() => new PdfBoundingBox("", 0, 0, 1, 1)).toThrowError(
      "PdfBoundingBox id must not be empty.",
    );
  });

  it("should reject non-finite coordinates", () => {
    expect(() => new PdfBoundingBox("box-1", Number.NaN, 0, 1, 1)).toThrowError(
      "PdfBoundingBox minX must be finite.",
    );
  });

  it("should reject maxX lower than minX", () => {
    expect(() => new PdfBoundingBox("box-1", 2, 0, 1, 1)).toThrowError(
      "PdfBoundingBox maxX must be greater than or equal to minX.",
    );
  });

  it("should reject maxY lower than minY", () => {
    expect(() => new PdfBoundingBox("box-1", 0, 2, 1, 1)).toThrowError(
      "PdfBoundingBox maxY must be greater than or equal to minY.",
    );
  });

  it("should reject negative width from bounds", () => {
    expect(() => PdfBoundingBox.fromBounds("box-1", 0, 0, -1, 1)).toThrowError(
      "PdfBoundingBox width must be greater than or equal to zero.",
    );
  });

  it("should reject negative height from bounds", () => {
    expect(() => PdfBoundingBox.fromBounds("box-1", 0, 0, 1, -1)).toThrowError(
      "PdfBoundingBox height must be greater than or equal to zero.",
    );
  });
});