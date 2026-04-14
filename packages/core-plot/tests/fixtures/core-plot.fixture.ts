import { svg, type ReactiveController, type ReactiveControllerHost } from "lit";

import { MappingController, type MappingViewport } from "../../src/controllers/mapping-controller.js";
import { AxisRange } from "../../src/coordinates/axis-range.js";
import { CoordinateSystem } from "../../src/coordinates/coordinate-system.js";
import { CanvasObject } from "../../src/core/canvas-object.js";
import type { RenderContext } from "../../src/core/render-context.js";
import { Point } from "../../src/domain/point.js";

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
      this.createAxisRange(-10, 10),
      this.createAxisRange(-10, 10),
    );
  }

  public createCanvasObject(id: string, minX = 0, minY = 0, maxX = 20, maxY = 20): TestCanvasObject {
    return new TestCanvasObject(id, minX, minY, maxX, maxY);
  }
}
