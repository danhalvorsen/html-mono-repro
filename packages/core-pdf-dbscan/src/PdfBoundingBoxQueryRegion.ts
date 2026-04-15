import type { IQuadTreeBounds } from "@monorepo/core-design-pattern-quad-tree-abstract";
import { QuadTreeBounds, QuadTreeRectangleQueryRegion } from "@monorepo/core-design-pattern-quad-tree-abstract";

import type { IPdfBoundingBox } from "./IPdfBoundingBox.js";

export class PdfBoundingBoxQueryRegion extends QuadTreeRectangleQueryRegion {
  public constructor(bounds: IQuadTreeBounds) {
    super(bounds);
  }

  public static around(candidate: IPdfBoundingBox, eps: number): PdfBoundingBoxQueryRegion {
    return new PdfBoundingBoxQueryRegion(
      new QuadTreeBounds(
        candidate.minX - eps,
        candidate.minY - eps,
        candidate.width + eps * 2,
        candidate.height + eps * 2,
      ),
    );
  }
}
