import { PdfPoint } from "./PdfPoint.js";

export class PdfBoundingBox {
  public readonly topLeft: PdfPoint;
  public readonly width: number;
  public readonly height: number;

  public constructor(topLeft: PdfPoint, width: number, height: number) {
    PdfBoundingBox.ensureFinite(width, "width");
    PdfBoundingBox.ensureFinite(height, "height");

    if (width < 0) {
      throw new Error("PdfBoundingBox width must be greater than or equal to zero.");
    }

    if (height < 0) {
      throw new Error("PdfBoundingBox height must be greater than or equal to zero.");
    }

    this.topLeft = topLeft;
    this.width = width;
    this.height = height;

    Object.freeze(this);
  }

  public get left(): number {
    return this.topLeft.x;
  }

  public get top(): number {
    return this.topLeft.y;
  }

  public get right(): number {
    return this.left + this.width;
  }

  public get bottom(): number {
    return this.top + this.height;
  }

  private static ensureFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`PdfBoundingBox ${name} must be finite.`);
    }
  }
}
