import { QuadTreeFactory } from "@monorepo/core-design-pattern-quad-tree";
import type { IQuadTree } from "@monorepo/core-design-pattern-quad-tree-abstract";
import { QuadTreeBounds } from "@monorepo/core-design-pattern-quad-tree-abstract";
import type { IBoundingBox } from "@monorepo/core-pdf-common";
import type { IPdfBoundingBoxDistance } from "./contracts/IPdfBoundingBoxDistance.js";
import type { IPdfBoundingBoxNeighborhoodQuery } from "./contracts/IPdfBoundingBoxNeighborhoodQuery.js";
import { PdfBoundingBoxDistance } from "./PdfBoundingBoxDistance.js";
import { PdfBoundingBoxQueryRegion } from "./PdfBoundingBoxQueryRegion.js";

export class QuadTreePdfBoundingBoxNeighborhoodQuery
  implements IPdfBoundingBoxNeighborhoodQuery
{
  private readonly tree: IQuadTree<IBoundingBox>;
  private readonly distance: IPdfBoundingBoxDistance;

  public constructor(
    boxes: readonly IBoundingBox[],
    distance: IPdfBoundingBoxDistance = new PdfBoundingBoxDistance(),
  ) {
    this.distance = distance;
    this.tree = new QuadTreeFactory<IBoundingBox>().create({
      rootBounds: this.createRootBounds(boxes),
      boundsProvider: {
        getBounds: (item) =>
          new QuadTreeBounds(item.min.x, item.min.y, item.width, item.height),
      },
      options: {
        maxDepth: 8,
        maxItemsPerNode: 8,
      },
    });

    this.tree.insertMany(boxes);
  }

  public findNeighbors(
    candidate: IBoundingBox,
    eps: number,
  ): readonly IBoundingBox[] {
    const region = PdfBoundingBoxQueryRegion.around(candidate, eps);
    const queried = this.tree.query(region);

    return Object.freeze(
      queried
        .filter((item) => this.distance.measure(candidate, item) <= eps)
        .slice()
        .sort((left, right) => left.id.localeCompare(right.id)),
    );
  }

  private createRootBounds(boxes: readonly IBoundingBox[]): QuadTreeBounds {
    if (boxes.length === 0) {
      return new QuadTreeBounds(0, 0, 1, 1);
    }

    const minX = Math.min(...boxes.map((box) => box.min.x));
    const minY = Math.min(...boxes.map((box) => box.min.y));
    const maxX = Math.max(...boxes.map((box) => box.max.x));
    const maxY = Math.max(...boxes.map((box) => box.max.y));

    return new QuadTreeBounds(
      minX,
      minY,
      Math.max(maxX - minX, 1),
      Math.max(maxY - minY, 1),
    );
  }
}
