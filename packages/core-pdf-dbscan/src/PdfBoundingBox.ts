import type { IBoundingBox, IPosition } from "@monorepo/core-pdf-common";

export class PdfBoundingBox implements IBoundingBox {
  public readonly id: string;
  public readonly min: IPosition;
  public readonly max: IPosition;
  public readonly width: number;
  public readonly height: number;

  public constructor(
    id: string,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ) {
    PdfBoundingBox.ensureNonEmpty(id, "id");
    PdfBoundingBox.ensureNumber(minX, "minX");
    PdfBoundingBox.ensureNumber(minY, "minY");
    PdfBoundingBox.ensureNumber(maxX, "maxX");
    PdfBoundingBox.ensureNumber(maxY, "maxY");

    if (maxX < minX) {
      throw new Error("PdfBoundingBox maxX must be greater than or equal to minX.");
    }

    if (maxY < minY) {
      throw new Error("PdfBoundingBox maxY must be greater than or equal to minY.");
    }

    this.id = id;
    this.min = Object.freeze({ x: minX, y: minY });
    this.max = Object.freeze({ x: maxX, y: maxY });
    this.width = maxX - minX;
    this.height = maxY - minY;

    Object.freeze(this);
  }

  public static fromBounds(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): PdfBoundingBox {
    PdfBoundingBox.ensureNumber(width, "width");
    PdfBoundingBox.ensureNumber(height, "height");

    if (width < 0) {
      throw new Error("PdfBoundingBox width must be greater than or equal to zero.");
    }

    if (height < 0) {
      throw new Error("PdfBoundingBox height must be greater than or equal to zero.");
    }

    return new PdfBoundingBox(id, x, y, x + width, y + height);
  }

  private static ensureNonEmpty(value: string, name: string): void {
    if (value.trim().length === 0) {
      throw new Error(`PdfBoundingBox ${name} must not be empty.`);
    }
  }

  private static ensureNumber(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`PdfBoundingBox ${name} must be finite.`);
    }
  }
}