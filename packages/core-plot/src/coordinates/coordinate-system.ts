import { svg, type ReactiveControllerHost, type TemplateResult } from "lit";

import { MappingController, type MappingViewport } from "../controllers/mapping-controller.js";
import {
  CanvasObject,
  type CanvasObjectBounds,
  type HitTestContext,
} from "../core/canvas-object.js";
import type { RenderContext } from "../core/render-context.js";
import { Point } from "../domain/point.js";
import { CORE_PLOT_THEME } from "../styles/core-plot-style-system.js";
import { Axis } from "./axis.js";
import { AxisTickDensityPolicy } from "./axis-tick-density-policy.js";
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
  private readonly tickDensityPolicy: AxisTickDensityPolicy;

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
    this.tickDensityPolicy = new AxisTickDensityPolicy();
  }

  public override getCapabilities() {
    return {
      clickable: true,
    };
  }

  public override getBounds(context: RenderContext): CanvasObjectBounds {
    const viewport = this.createViewport(context);
    return {
      x: viewport.left,
      y: viewport.top,
      width: viewport.width,
      height: viewport.height,
    };
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
      tickValues: this.buildTickValues(this.xRange, viewport.width),
    });

    this.verticalAxis.setLayout({
      startX: zero.x,
      startY: viewport.top,
      endX: zero.x,
      endY: viewport.top + viewport.height,
      zeroX: zero.x,
      zeroY: zero.y,
      tickValues: this.buildTickValues(this.yRange, viewport.height),
    });

    const plottedPoints = this.points.map((point) => {
      const mapped = this.mappingController.mapToSvg(point, this.xRange, this.yRange, viewport);
      const pointIsHighlighted = context.selectedObjectId === this.id;
      return svg`
        <g data-point-label=${point.label}>
          <circle
            cx=${mapped.x}
            cy=${mapped.y}
            r=${pointIsHighlighted ? "8" : "6.5"}
            fill=${pointIsHighlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.overlay}
          ></circle>
          <circle
            cx=${mapped.x}
            cy=${mapped.y}
            r=${pointIsHighlighted ? "14" : "11"}
            fill="none"
            stroke=${pointIsHighlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.overlayMuted}
            stroke-width=${pointIsHighlighted ? "2" : "1"}
          ></circle>
          <text
            x=${mapped.x + 12}
            y=${mapped.y - 10}
            fill=${pointIsHighlighted ? CORE_PLOT_THEME.colors.routeActive : CORE_PLOT_THEME.colors.textPrimary}
            font-size="12"
            font-family=${CORE_PLOT_THEME.typography.fontFamily.ui}
          >
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
          fill=${CORE_PLOT_THEME.colors.panelSurfaceSubtle}
          stroke=${context.selectedObjectId === this.id
            ? CORE_PLOT_THEME.colors.routeActive
            : CORE_PLOT_THEME.colors.panelBorder}
          stroke-width=${context.selectedObjectId === this.id ? "2" : "1"}
        ></rect>
        ${this.horizontalAxis.render(context)}
        ${this.verticalAxis.render(context)}
        ${plottedPoints}
      </g>
    `;
  }

  public override hitTest(context: HitTestContext): boolean {
    const viewport = this.createViewport({ width: 840, height: 520, selectedObjectId: null });
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

  private buildTickValues(range: AxisRange, pixelLength: number): readonly number[] {
    return this.tickDensityPolicy.buildVisibleTickValues(range, pixelLength);
  }
}
