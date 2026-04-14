import { describe, expect, it } from "vitest";

import { CanvasObjectRegistry } from "../src/core/canvas-object-registry.js";
import { CanvasHitTestService } from "../src/services/canvas-hit-test-service.js";
import { QuadTreeCanvasSpatialIndex } from "../src/services/canvas-spatial-index.js";
import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

describe("CanvasHitTestService", () => {
  const fixture = new CorePlotFixture();

  it("should preserve top-most resolution after quad-tree candidate lookup", () => {
    const registry = new CanvasObjectRegistry();
    const lower = fixture.createCanvasObject("lower", 0, 0, 60, 60);
    const upper = fixture.createCanvasObject("upper", 10, 10, 70, 70);
    registry.register(lower);
    registry.register(upper);

    const service = new CanvasHitTestService(
      registry,
      new QuadTreeCanvasSpatialIndex(),
      () => fixture.createRenderContext(),
    );

    expect(service.queryTopMost({ x: 20, y: 20 })?.id).toBe("upper");
  });

  it("should return no candidates when the point misses all indexed bounds", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(fixture.createCanvasObject("only", 0, 0, 20, 20));
    const service = new CanvasHitTestService(
      registry,
      new QuadTreeCanvasSpatialIndex(),
      () => fixture.createRenderContext(),
    );

    expect(service.queryPoint({ x: 120, y: 120 })).toHaveLength(0);
  });
});

