import { PdfBoundingBox } from "./PdfBoundingBox.js";
import { PdfTextItemQuad } from "./PdfTextItemQuad.js";

export class PdfTextItemBoundingBox {
  public readonly text: string;
  public readonly angleRadians: number;
  public readonly quad: PdfTextItemQuad;
  public readonly bounds: PdfBoundingBox;

  public constructor(
    text: string,
    angleRadians: number,
    quad: PdfTextItemQuad,
    bounds: PdfBoundingBox,
  ) {
    if (text.trim().length === 0) {
      throw new Error("PdfTextItemBoundingBox text must not be empty.");
    }

    if (!Number.isFinite(angleRadians)) {
      throw new Error("PdfTextItemBoundingBox angleRadians must be finite.");
    }

    this.text = text;
    this.angleRadians = angleRadians;
    this.quad = quad;
    this.bounds = bounds;

    Object.freeze(this);
  }
}
