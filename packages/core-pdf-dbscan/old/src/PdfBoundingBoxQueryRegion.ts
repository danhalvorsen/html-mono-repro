import type { IQuadTreeBounds } from "@monorepo/core-design-pattern-quad-tree-abstract";
import { QuadTreeBounds, QuadTreeRectangleQueryRegion } from "@monorepo/core-design-pattern-quad-tree-abstract";

import type { IBoundingBox } from "@monorepo/core-pdf-common";
 
export class PdfBoundingBoxQueryRegion extends QuadTreeRectangleQueryRegion {
  public constructor(bounds: IQuadTreeBounds) {
    super(bounds);
  }

  public static around(candidate: IBoundingBox, eps: number): PdfBoundingBoxQueryRegion {
    return new PdfBoundingBoxQueryRegion(
      new QuadTreeBounds(
        candidate.min.x - eps,
        candidate.min.y - eps,
        candidate.width + eps * 2,
        candidate.height + eps * 2,
      ),
    );
  }
}
