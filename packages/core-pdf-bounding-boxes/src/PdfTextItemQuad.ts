import { PdfPoint } from "./PdfPoint.js";

export class PdfTextItemQuad {
  public readonly topLeft: PdfPoint;
  public readonly topRight: PdfPoint;
  public readonly bottomRight: PdfPoint;
  public readonly bottomLeft: PdfPoint;

  public constructor(
    topLeft: PdfPoint,
    topRight: PdfPoint,
    bottomRight: PdfPoint,
    bottomLeft: PdfPoint,
  ) {
    this.topLeft = topLeft;
    this.topRight = topRight;
    this.bottomRight = bottomRight;
    this.bottomLeft = bottomLeft;

    Object.freeze(this);
  }
}
