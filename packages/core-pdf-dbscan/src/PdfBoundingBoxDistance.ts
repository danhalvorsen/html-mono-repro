import type { IPdfBoundingBoxDistance } from "./IPdfBoundingBoxDistance.js";
import type { IPdfBoundingBox } from "./IPdfBoundingBox.js";

export class PdfBoundingBoxDistance implements IPdfBoundingBoxDistance {
  public measure(left: IPdfBoundingBox, right: IPdfBoundingBox): number {
    const horizontalGap = this.axisGap(left.minX, left.maxX, right.minX, right.maxX);
    const verticalGap = this.axisGap(left.minY, left.maxY, right.minY, right.maxY);

    return Math.hypot(horizontalGap, verticalGap);
  }

  private axisGap(
    leftMin: number,
    leftMax: number,
    rightMin: number,
    rightMax: number,
  ): number {
    if (leftMax < rightMin) {
      return rightMin - leftMax;
    }

    if (rightMax < leftMin) {
      return leftMin - rightMax;
    }

    return 0;
  }
}
