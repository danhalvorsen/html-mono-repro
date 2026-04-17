import type { IBoundingBox } from "@monorepo/core-pdf-common";
import type { IPdfBoundingBoxDistance } from "./IPdfBoundingBoxDistance.js";

export class PdfBoundingBoxDistance implements IPdfBoundingBoxDistance {
  public measure(left: IBoundingBox, right: IBoundingBox): number {
    const horizontalGap = this.axisGap(
      left.min.x,
      left.max.x,
      right.min.x,
      right.max.x,
    );

    const verticalGap = this.axisGap(
      left.min.y,
      left.max.y,
      right.min.y,
      right.max.y,
    );

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