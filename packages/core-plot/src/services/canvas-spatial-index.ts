import { QuadTreeFactory } from "@monorepo/core-design-pattern-quad-tree";
import {
  QuadTreeBounds,
  QuadTreeRectangleQueryRegion,
} from "@monorepo/core-design-pattern-quad-tree-abstract";
import { CanvasObject, CanvasObjectBounds, RenderContext } from "@monorepo/core-plot-canvas";

export interface CanvasSpatialIndex {
  queryPoint(
    objects: readonly CanvasObject[],
    point: { x: number; y: number },
    context: RenderContext,
  ): readonly CanvasObject[];
}

export class QuadTreeCanvasSpatialIndex implements CanvasSpatialIndex {
  private readonly factory = new QuadTreeFactory<CanvasObject>();

  public queryPoint(
    objects: readonly CanvasObject[],
    point: { x: number; y: number },
    context: RenderContext,
  ): readonly CanvasObject[] {
    const boundedObjects = objects.filter((object) => object.getBounds(context) !== null);
    if (boundedObjects.length === 0) {
      return [];
    }

    const tree = this.factory.create({
      rootBounds: new QuadTreeBounds(0, 0, context.width, context.height),
      boundsProvider: {
        getBounds: (item) => this.toQuadTreeBounds(item.getBounds(context)!),
      },
      options: {
        maxDepth: 6,
        maxItemsPerNode: 4,
      },
    });

    tree.insertMany(boundedObjects);

    return tree.query(
      new QuadTreeRectangleQueryRegion(
        new QuadTreeBounds(point.x, point.y, 1, 1),
      ),
    );
  }

  private toQuadTreeBounds(bounds: CanvasObjectBounds): QuadTreeBounds {
    return new QuadTreeBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  }
}
