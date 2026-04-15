import type { CanvasObject, CanvasObjectRegistry, RenderContext } from "@monorepo/core-plot-canvas";
import type { CanvasSpatialIndex } from "./canvas-spatial-index.js";

export class CanvasHitTestService {
  private readonly registry: CanvasObjectRegistry;
  private readonly spatialIndex: CanvasSpatialIndex;
  private readonly renderContextProvider: () => RenderContext;

  public constructor(
    registry: CanvasObjectRegistry,
    spatialIndex: CanvasSpatialIndex,
    renderContextProvider: () => RenderContext,
  ) {
    this.registry = registry;
    this.spatialIndex = spatialIndex;
    this.renderContextProvider = renderContextProvider;
  }

  public queryPoint(point: { x: number; y: number }): readonly CanvasObject[] {
    const context = this.renderContextProvider();
    const allObjects = this.registry.getAll();
    const broadPhaseMatches = this.spatialIndex.queryPoint(allObjects, point, context);
    const boundedIds = new Set(broadPhaseMatches.map((object) => object.id));

    return allObjects.filter((object) => {
      if (object.getBounds(context) === null) {
        return object.hitTest(point);
      }

      if (!boundedIds.has(object.id)) {
        return false;
      }

      return object.hitTest(point);
    });
  }

  public queryTopMost(point: { x: number; y: number }): CanvasObject | null {
    const hits = this.queryPoint(point);

    for (let index = hits.length - 1; index >= 0; index -= 1) {
      const object = hits[index];
      if (object !== undefined) {
        return object;
      }
    }

    return null;
  }
}
