import { describe, expect, it } from "vitest";

import { DbscanPdfBoundingBoxClusterer } from "../../src/DbscanPdfBoundingBoxClusterer.js";
import { PdfBoundingBoxFixture } from "./fixtures/PdfBoundingBoxFixture.js";

const fixture = new PdfBoundingBoxFixture();

describe("DbscanPdfBoundingBoxClusterer", () => {
  it("should return empty result for empty input", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();

    const result = sut.cluster([], 1, 1);

    expect(result.clusters).toHaveLength(0);
    expect(result.noise).toHaveLength(0);
  });

  it("should create one cluster for a single item when minPts is one", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();
    const boxes = fixture.createSingle();

    const result = sut.cluster(boxes, 0, 1);

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.items.map((item) => item.id)).toEqual(["a"]);
    expect(result.noise).toHaveLength(0);
  });

  it("should classify a single item as noise when minPts is greater than one", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();
    const boxes = fixture.createSingle();

    const result = sut.cluster(boxes, 0, 2);

    expect(result.clusters).toHaveLength(0);
    expect(result.noise.map((item) => item.id)).toEqual(["a"]);
  });

  it("should cluster two neighboring boxes when density is satisfied", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();
    const boxes = fixture.createNeighborPair();

    const result = sut.cluster(boxes, 1, 2);

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.items.map((item) => item.id)).toEqual(["a", "b"]);
    expect(result.noise).toHaveLength(0);
  });

  it("should classify distant boxes as noise", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();
    const boxes = fixture.createDistantPair();

    const result = sut.cluster(boxes, 1, 2);

    expect(result.clusters).toHaveLength(0);
    expect(result.noise.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("should form one cluster through density connectivity", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();
    const boxes = fixture.createConnectivityChain();

    const result = sut.cluster(boxes, 1, 2);

    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.items.map((item) => item.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("should form separate clusters for separate dense regions", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();
    const boxes = fixture.createSeparateDenseRegions();

    const result = sut.cluster(boxes, 0, 2);

    expect(result.clusters).toHaveLength(2);
    expect(result.clusters.map((cluster) => cluster.items.map((item) => item.id))).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("should be deterministic for identical input", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();
    const boxes = fixture.createUnorderedConnectivityChain();

    const first = sut.cluster(boxes, 1, 2);
    const second = sut.cluster(boxes, 1, 2);

    expect(first).toEqual(second);
  });

  it("should conserve all input items exactly once across clusters and noise", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();
    const boxes = fixture.createConservationSample();

    const result = sut.cluster(boxes, 0, 2);
    const all = [
      ...result.clusters.flatMap((cluster) => cluster.items),
      ...result.noise,
    ].map((item) => item.id);

    expect(all.sort()).toEqual(["a", "b", "c"]);
  });

  it("should reject negative eps", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();

    expect(() => sut.cluster(fixture.createSingle(), -1, 1)).toThrowError(
      "eps must be a finite number greater than or equal to zero.",
    );
  });

  it("should reject non-finite eps", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();

    expect(() => sut.cluster(fixture.createSingle(), Number.NaN, 1)).toThrowError(
      "eps must be a finite number greater than or equal to zero.",
    );
  });

  it("should reject non-integer minPts", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();

    expect(() =>
      sut.cluster(fixture.createSingle(), 0, 1.5),
    ).toThrowError("minPts must be an integer greater than or equal to one.");
  });

  it("should reject minPts below one", () => {
    const sut = new DbscanPdfBoundingBoxClusterer();

    expect(() => sut.cluster(fixture.createSingle(), 0, 0)).toThrowError(
      "minPts must be an integer greater than or equal to one.",
    );
  });
});
