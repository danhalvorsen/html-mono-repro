import { svg, type ReactiveControllerHost, type TemplateResult } from "lit";

import { MappingController, type MappingViewport } from "../controllers/mapping-controller.js";
import { CanvasObject, type HitTestContext } from "../core/canvas-object.js";
import type { RenderContext } from "../core/render-context.js";
import { Point } from "../domain/point.js";
import { Axis } from "./axis.js";
import { AxisRange } from "./axis-range.js";
import type { GridLineModel } from "../controllers/grid-controller.js";
import type { SnapResult } from "../controllers/snap-controller.js";

export class CoordinateSystem extends CanvasObject {
  private readonly horizontalAxis: Axis;
  private readonly verticalAxis: Axis;
  private readonly points: Point[];
  private readonly mappingController: MappingController;
  private readonly xRange: AxisRange;
  private readonly yRange: AxisRange;

  public constructor(
    host: ReactiveControllerHost,
    id: string,
    points: readonly Point[],
    xRange = new AxisRange(),
    yRange = new AxisRange(),
  ) {
    super(id);
    this.points = [...points];
    this.xRange = xRange;
    this.yRange = yRange;
    this.horizontalAxis = new Axis(`${id}-x-axis`, "horizontal", this.xRange);
    this.verticalAxis = new Axis(`${id}-y-axis`, "vertical", this.yRange);
    this.mappingController = new MappingController(host);
  }

  public override render(context: RenderContext): TemplateResult {
    const viewport = this.createViewport(context);
    const zero = this.mappingController.mapToSvg(
      { x: 0, y: 0 },
      this.xRange,
      this.yRange,
      viewport,
    );

    this.horizontalAxis.setLayout({
      startX: viewport.left,
      startY: zero.y,
      endX: viewport.left + viewport.width,
      endY: zero.y,
      zeroX: zero.x,
      zeroY: zero.y,
      tickValues: this.buildTickValues(this.xRange),
    });

    this.verticalAxis.setLayout({
      startX: zero.x,
      startY: viewport.top,
      endX: zero.x,
      endY: viewport.top + viewport.height,
      zeroX: zero.x,
      zeroY: zero.y,
      tickValues: this.buildTickValues(this.yRange),
    });

    const plottedPoints = this.points.map((point) => {
      const mapped = this.mappingController.mapToSvg(point, this.xRange, this.yRange, viewport);
      return svg`
        <g data-point-label=${point.label}>
          <circle cx=${mapped.x} cy=${mapped.y} r="6.5" fill="#f59f46"></circle>
          <circle cx=${mapped.x} cy=${mapped.y} r="11" fill="none" stroke="rgba(245,159,70,0.35)"></circle>
          <text x=${mapped.x + 12} y=${mapped.y - 10} fill="#f6efe0" font-size="12" font-family='"IBM Plex Mono", monospace'>
            ${point.label} (${point.x}, ${point.y})
          </text>
        </g>
      `;
    });

    return svg`
      <g data-object-id=${this.id}>
        <rect
          x=${viewport.left}
          y=${viewport.top}
          width=${viewport.width}
          height=${viewport.height}
          rx="20"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(239,232,217,0.12)"
        ></rect>
        ${this.horizontalAxis.render(context)}
        ${this.verticalAxis.render(context)}
        ${plottedPoints}
      </g>
    `;
  }

  public override hitTest(context: HitTestContext): boolean {
    const viewport = this.createViewport({ width: 840, height: 520 });
    return this.points.some((point) => {
      const mapped = this.mappingController.mapToSvg(point, this.xRange, this.yRange, viewport);
      const dx = context.x - mapped.x;
      const dy = context.y - mapped.y;
      return dx * dx + dy * dy <= 144;
    });
  }

  public mapSvgToCartesian(svgPoint: { x: number; y: number }, context: RenderContext): { x: number; y: number } {
    return this.mappingController.mapToCartesian(
      svgPoint,
      this.xRange,
      this.yRange,
      this.createViewport(context),
    );
  }

  public getGridLines(context: RenderContext): readonly GridLineModel[] {
    const viewport = this.createViewport(context);
    const xLines: GridLineModel[] = [];
    const yLines: GridLineModel[] = [];

    for (let value = Math.ceil(this.xRange.min); value <= Math.floor(this.xRange.max); value += 1) {
      const mapped = this.mappingController.mapToSvg(
        { x: value, y: 0 },
        this.xRange,
        this.yRange,
        viewport,
      );
      xLines.push({
        x1: mapped.x,
        y1: viewport.top,
        x2: mapped.x,
        y2: viewport.top + viewport.height,
        emphasis: value === 0,
      });
    }

    for (let value = Math.ceil(this.yRange.min); value <= Math.floor(this.yRange.max); value += 1) {
      const mapped = this.mappingController.mapToSvg(
        { x: 0, y: value },
        this.xRange,
        this.yRange,
        viewport,
      );
      yLines.push({
        x1: viewport.left,
        y1: mapped.y,
        x2: viewport.left + viewport.width,
        y2: mapped.y,
        emphasis: value === 0,
      });
    }

    return [...xLines, ...yLines];
  }

  public snapSvgPoint(svgPoint: { x: number; y: number }, context: RenderContext): SnapResult {
    const cartesian = this.mapSvgToCartesian(svgPoint, context);
    const snappedCartesian = {
      x: Math.round(cartesian.x),
      y: Math.round(cartesian.y),
    };
    const snappedSvg = this.mappingController.mapToSvg(
      snappedCartesian,
      this.xRange,
      this.yRange,
      this.createViewport(context),
    );

    return {
      x: snappedSvg.x,
      y: snappedSvg.y,
      label: `${snappedCartesian.x}, ${snappedCartesian.y}`,
    };
  }

  private createViewport(context: RenderContext): MappingViewport {
    return {
      left: 80,
      top: 48,
      width: context.width - 140,
      height: context.height - 108,
    };
  }

  private buildTickValues(range: AxisRange): readonly number[] {
    const values: number[] = [];
    for (let value = range.min; value <= range.max; value += 2) {
      values.push(value);
    }

    return values;
  }
}
