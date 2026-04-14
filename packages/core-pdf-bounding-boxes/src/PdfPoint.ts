export class PdfPoint {
  public readonly x: number;
  public readonly y: number;

  public constructor(x: number, y: number) {
    PdfPoint.ensureFinite(x, "x");
    PdfPoint.ensureFinite(y, "y");

    this.x = x;
    this.y = y;

    Object.freeze(this);
  }

  private static ensureFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`PdfPoint ${name} must be finite.`);
    }
  }
}
