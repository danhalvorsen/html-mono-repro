import { svg, type ReactiveController, type ReactiveControllerHost } from "lit";

import { MappingController, type MappingViewport } from "../../src/controllers/mapping-controller.js";
import { AxisRange } from "../../src/coordinates/axis-range.js";
import { CoordinateSystem } from "../../src/coordinates/coordinate-system.js";
import { CanvasObject } from "../../src/core/canvas-object.js";
import type { RenderContext } from "../../src/core/render-context.js";
import { InterpolatedCurve } from "@monorepo/core-plot-curve";
import { Point } from "../../src/domain/point.js";
import { PlotRectangle } from "../../src/domain/rectangle.js";
import type { Rectangle2 } from "@monorepo/core-math";

class FixtureReactiveHost implements ReactiveControllerHost {
  private readonly controllers: ReactiveController[] = [];
  private updateCount = 0;

  public addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  public removeController(controller: ReactiveController): void {
    const index = this.controllers.indexOf(controller);
    if (index >= 0) {
      this.controllers.splice(index, 1);
    }
  }

  public requestUpdate(): void {
    this.updateCount += 1;
  }

  public getRequestUpdateCount(): number {
    return this.updateCount;
  }
}

export class TestCanvasObject extends CanvasObject {
  private readonly minX: number;
  private readonly minY: number;
  private readonly maxX: number;
  private readonly maxY: number;

  public constructor(
    id: string,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ) {
    super(id);
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  public override render() {
    return svg`<g data-test-object=${this.id}></g>`;
  }

  public override getBounds() {
    return {
      x: this.minX,
      y: this.minY,
      width: this.maxX - this.minX,
      height: this.maxY - this.minY,
    };
  }

  public override getCapabilities() {
    return {
      clickable: true,
      draggable: true,
      doubleClickable: true,
    };
  }

  public override hitTest(context: { x: number; y: number }): boolean {
    return (
      context.x >= this.minX &&
      context.x <= this.maxX &&
      context.y >= this.minY &&
      context.y <= this.maxY
    );
  }
}

export class CorePlotFixture {
  public createReactiveHost(): FixtureReactiveHost {
    return new FixtureReactiveHost();
  }

  public createRenderContext(): RenderContext {
    return {
      width: 840,
      height: 520,
      selectedObjectId: null,
    };
  }

  public createViewport(): MappingViewport {
    return {
      left: 80,
      top: 48,
      width: 700,
      height: 412,
    };
  }

  public createAxisRange(min = -10, max = 10): AxisRange {
    return new AxisRange(min, max);
  }

  public createMappingController(): MappingController {
    return new MappingController(this.createReactiveHost());
  }

  public createPoint(x: number, y: number, label = "P"): Point {
    return new Point(x, y, label);
  }

  public createPointSet(): readonly Point[] {
    return [
      this.createPoint(-7, -3, "A"),
      this.createPoint(-2, 5, "B"),
      this.createPoint(3, 2, "C"),
      this.createPoint(8, 7, "D"),
    ];
  }

  public createCoordinateSystem(): CoordinateSystem {
    return new CoordinateSystem(
      this.createReactiveHost(),
      "coordinate-system-fixture",
      this.createPointSet(),
      this.createRectangleSet(),
      this.createAxisRange(-10, 10),
      this.createAxisRange(-10, 10),
      this.createCurveSet(),
    );
  }

  public createRectangle(bounds: Rectangle2, label = "R"): PlotRectangle {
    return new PlotRectangle(bounds, label);
  }

  public createRectangleSet(): readonly PlotRectangle[] {
    return [
      this.createRectangle({ x: -8, y: -6, width: 4, height: 3 }, "Zone A"),
      this.createRectangle({ x: 1, y: 1, width: 3, height: 5 }, "Zone B"),
    ];
  }

  public createCurve(points: readonly Point[], label = "g"): InterpolatedCurve {
    return new InterpolatedCurve(points, label);
  }

  public createCurveSet(): readonly InterpolatedCurve[] {
    return [this.createCurve(this.createPointSet(), "g")];
  }

  public createCanvasObject(id: string, minX = 0, minY = 0, maxX = 20, maxY = 20): TestCanvasObject {
    return new TestCanvasObject(id, minX, minY, maxX, maxY);
  }
}
