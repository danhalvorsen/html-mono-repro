import { describe, expect, it } from "vitest";
import { CanvasObjectRegistry } from "@monorepo/core-plot-canvas";

import { CoordinateSystem } from "../src/coordinates/coordinate-system.js";
import { OnClickController } from "../src/controllers/on-click-controller.js";
import { CanvasHitTestService } from "../src/services/canvas-hit-test-service.js";
import { QuadTreeCanvasSpatialIndex } from "../src/services/canvas-spatial-index.js";
import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

class ClickHost extends EventTarget {
  public controllers: unknown[] = [];
  public updates = 0;

  public addController(controller: unknown): void {
    this.controllers.push(controller);
  }

  public requestUpdate(): void {
    this.updates += 1;
  }
}

describe("OnClickController", () => {
  const fixture = new CorePlotFixture();

  it("should select the top-most clickable canvas object on click", () => {
    const host = new ClickHost() as ClickHost & HTMLElement;
    const registry = new CanvasObjectRegistry();
    const lower = fixture.createCanvasObject("lower", 0, 0, 40, 40);
    const upper = fixture.createCanvasObject("upper", 10, 10, 50, 50);
    registry.register(lower);
    registry.register(upper);
    const hitTestService = new CanvasHitTestService(
      registry,
      new QuadTreeCanvasSpatialIndex(),
      () => fixture.createRenderContext(),
    );

    const mouseController = {
      pointer: {
        canvasX: 20,
        canvasY: 20,
      },
    };

    const controller = new OnClickController(
      host,
      hitTestService,
      mouseController as never,
      () => fixture.createRenderContext(),
    );
    controller.hostConnected();
    host.dispatchEvent(new Event("click"));
    
    expect(controller.selection?.id).toBe("upper");
    expect(host.updates).toBe(1);
  });

  it("should select a point inside the coordinate system when clicking on its mapped svg position", () => {
    const host = new ClickHost() as ClickHost & HTMLElement;
    const registry = new CanvasObjectRegistry();
    const points = fixture.createPointSet();
    const coordinateSystem = new CoordinateSystem(
      fixture.createReactiveHost(),
      "coordinate-system-fixture",
      points,
    );
    const renderContext = fixture.createRenderContext();
    registry.register(coordinateSystem);
    const hitTestService = new CanvasHitTestService(
      registry,
      new QuadTreeCanvasSpatialIndex(),
      () => renderContext,
    );
    const point = points[1];
    const mapped = coordinateSystem.mapCartesianPointToSvg(point, renderContext);
    const mouseController = {
      pointer: {
        canvasX: mapped.x,
        canvasY: mapped.y,
      },
    };

    const controller = new OnClickController(
      host,
      hitTestService,
      mouseController as never,
      () => renderContext,
    );
    controller.hostConnected();
    host.dispatchEvent(new Event("click"));

    expect(controller.selection?.id).toBe("coordinate-system-fixture");
    expect(controller.selectedPoint).toBe(point.id);
  });

  it("should clear selection when no clickable object is hit", () => {
    const host = new ClickHost() as ClickHost & HTMLElement;
    const registry = new CanvasObjectRegistry();
    registry.register(fixture.createCanvasObject("only", 0, 0, 20, 20));
    const hitTestService = new CanvasHitTestService(
      registry,
      new QuadTreeCanvasSpatialIndex(),
      () => fixture.createRenderContext(),
    );

    const mouseController = {
      pointer: {
        canvasX: 100,
        canvasY: 100,
      },
    };

    const controller = new OnClickController(
      host,
      hitTestService,
      mouseController as never,
      () => fixture.createRenderContext(),
    );
    controller.hostConnected();
    host.dispatchEvent(new Event("click"));

    expect(controller.selection).toBeNull();
  });
});
