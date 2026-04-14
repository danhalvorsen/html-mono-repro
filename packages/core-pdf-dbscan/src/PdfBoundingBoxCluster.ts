import type { IPdfBoundingBox } from "./IPdfBoundingBox.js";

export class PdfBoundingBoxCluster {
  public readonly id: string;
  public readonly items: readonly IPdfBoundingBox[];

  public constructor(id: string, items: readonly IPdfBoundingBox[]) {
    this.id = id;
    this.items = Object.freeze([...items]);
    Object.freeze(this);
  }
}
