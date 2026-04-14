import { QuadTreeFactory } from "@monorepo/core-design-pattern-quad-tree";
import type { IQuadTree } from "@monorepo/core-design-pattern-quad-tree-abstract";
import { QuadTreeBounds } from "@monorepo/core-design-pattern-quad-tree-abstract";

import type { IPdfBoundingBox } from "./IPdfBoundingBox.js";
import type { IPdfBoundingBoxDistance } from "./IPdfBoundingBoxDistance.js";
import type { IPdfBoundingBoxNeighborhoodQuery } from "./IPdfBoundingBoxNeighborhoodQuery.js";
import { PdfBoundingBoxDistance } from "./PdfBoundingBoxDistance.js";
import { PdfBoundingBoxQueryRegion } from "./PdfBoundingBoxQueryRegion.js";

export class QuadTreePdfBoundingBoxNeighborhoodQuery
  implements IPdfBoundingBoxNeighborhoodQuery
{
  private readonly tree: IQuadTree<IPdfBoundingBox>;
  private readonly distance: IPdfBoundingBoxDistance;

  public constructor(
    boxes: readonly IPdfBoundingBox[],
    distance: IPdfBoundingBoxDistance = new PdfBoundingBoxDistance(),
  ) {
    this.distance = distance;
    this.tree = new QuadTreeFactory<IPdfBoundingBox>().create({
      rootBounds: this.createRootBounds(boxes),
      boundsProvider: {
        getBounds: (item) =>
          new QuadTreeBounds(item.minX, item.minY, item.width, item.height),
      },
      options: {
        maxDepth: 8,
        maxItemsPerNode: 8,
      },
    });

    this.tree.insertMany(boxes);
  }

  public findNeighbors(
    candidate: IPdfBoundingBox,
    eps: number,
  ): readonly IPdfBoundingBox[] {
    const region = PdfBoundingBoxQueryRegion.around(candidate, eps);
    const queried = this.tree.query(region);

    return Object.freeze(
      queried
        .filter((item) => this.distance.measure(candidate, item) <= eps)
        .slice()
        .sort((left, right) => left.id.localeCompare(right.id)),
    );
  }

  private createRootBounds(boxes: readonly IPdfBoundingBox[]): QuadTreeBounds {
    if (boxes.length === 0) {
      return new QuadTreeBounds(0, 0, 1, 1);
    }

    const minX = Math.min(...boxes.map((box) => box.minX));
    const minY = Math.min(...boxes.map((box) => box.minY));
    const maxX = Math.max(...boxes.map((box) => box.maxX));
    const maxY = Math.max(...boxes.map((box) => box.maxY));

    return new QuadTreeBounds(
      minX,
      minY,
      Math.max(maxX - minX, 1),
      Math.max(maxY - minY, 1),
    );
  }
}
