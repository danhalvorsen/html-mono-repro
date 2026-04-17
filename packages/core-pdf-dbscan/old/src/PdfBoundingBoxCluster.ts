import { IBoundingBox } from "@monorepo/core-pdf-common";

export class PdfBoundingBoxCluster {
  public readonly id: string;
  public readonly items: readonly IBoundingBox[];

  public constructor(id: string, items: readonly IBoundingBox[]) {
    this.id = id;
    this.items = Object.freeze([...items]);
    Object.freeze(this);
  }
}
