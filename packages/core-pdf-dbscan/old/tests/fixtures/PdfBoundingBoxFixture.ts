import { PdfBoundingBox } from "../../../src/PdfBoundingBox.js";

export class PdfBoundingBoxFixture {
  public create(
    id: string,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): PdfBoundingBox {
    return new PdfBoundingBox(id, minX, minY, maxX, maxY);
  }

  public createSingle(): readonly PdfBoundingBox[] {
    return [this.create("a", 0, 0, 1, 1)];
  }

  public createNeighborPair(): readonly PdfBoundingBox[] {
    return [
      this.create("a", 0, 0, 1, 1),
      this.create("b", 2, 0, 3, 1),
    ];
  }

  public createDistantPair(): readonly PdfBoundingBox[] {
    return [
      this.create("a", 0, 0, 1, 1),
      this.create("b", 10, 0, 11, 1),
    ];
  }

  public createConnectivityChain(): readonly PdfBoundingBox[] {
    return [
      this.create("a", 0, 0, 1, 1),
      this.create("b", 2, 0, 3, 1),
      this.create("c", 4, 0, 5, 1),
    ];
  }

  public createSeparateDenseRegions(): readonly PdfBoundingBox[] {
    return [
      this.create("a", 0, 0, 1, 1),
      this.create("b", 1, 0, 2, 1),
      this.create("c", 20, 0, 21, 1),
      this.create("d", 21, 0, 22, 1),
    ];
  }

  public createConservationSample(): readonly PdfBoundingBox[] {
    return [
      this.create("a", 0, 0, 1, 1),
      this.create("b", 1, 0, 2, 1),
      this.create("c", 10, 0, 11, 1),
    ];
  }

  public createUnorderedConnectivityChain(): readonly PdfBoundingBox[] {
    return [
      this.create("c", 4, 0, 5, 1),
      this.create("a", 0, 0, 1, 1),
      this.create("b", 2, 0, 3, 1),
    ];
  }

  public createNeighborhoodSample(): readonly PdfBoundingBox[] {
    return [
      this.create("b", 4, 0, 6, 2),
      this.create("a", 0, 0, 2, 2),
      this.create("c", 20, 0, 22, 2),
    ];
  }

  public createOverlappingPair(): readonly [PdfBoundingBox, PdfBoundingBox] {
    return [
      this.create("a", 0, 0, 10, 10),
      this.create("b", 5, 5, 15, 15),
    ];
  }

  public createTouchingPair(): readonly [PdfBoundingBox, PdfBoundingBox] {
    return [
      this.create("a", 0, 0, 10, 10),
      this.create("b", 10, 10, 20, 20),
    ];
  }

  public createDegeneratePair(): readonly [PdfBoundingBox, PdfBoundingBox] {
    return [
      this.create("a", 0, 0, 0, 10),
      this.create("b", 5, 0, 5, 10),
    ];
  }
}
