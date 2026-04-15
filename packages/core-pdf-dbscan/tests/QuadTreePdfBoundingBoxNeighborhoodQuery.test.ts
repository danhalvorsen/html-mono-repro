import { describe, expect, it } from "vitest";

import { QuadTreePdfBoundingBoxNeighborhoodQuery } from "../src/QuadTreePdfBoundingBoxNeighborhoodQuery.js";
import { PdfBoundingBoxFixture } from "./fixtures/PdfBoundingBoxFixture.js";

const fixture = new PdfBoundingBoxFixture();

describe("QuadTreePdfBoundingBoxNeighborhoodQuery", () => {
  it("should return deterministic neighbors within eps", () => {
    const boxes = fixture.createNeighborhoodSample();
    const sut = new QuadTreePdfBoundingBoxNeighborhoodQuery(boxes);

    const result = sut.findNeighbors(boxes[1]!, 2);

    expect(result.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("should return an empty result for a query with no neighbors", () => {
    const boxes = fixture.createNeighborhoodSample();
    const sut = new QuadTreePdfBoundingBoxNeighborhoodQuery(boxes);

    const result = sut.findNeighbors(fixture.create("z", 100, 100, 101, 101), 1);

    expect(result).toEqual([]);
  });

  it("should support empty source input", () => {
    const sut = new QuadTreePdfBoundingBoxNeighborhoodQuery([]);

    const result = sut.findNeighbors(fixture.create("z", 100, 100, 101, 101), 1);

    expect(result).toEqual([]);
  });
});
