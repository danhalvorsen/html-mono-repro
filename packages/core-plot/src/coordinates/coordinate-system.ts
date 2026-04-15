import { svg, type ReactiveControllerHost, type TemplateResult } from "lit";
import { BoundingBox2D, BoundingBox2DBuilder, Vector2 } from "@monorepo/core-math";
import {
  CanvasObject,
  type CanvasObjectBounds,
  type HitTestContext,
  type RenderContext,
} from "@monorepo/core-plot-canvas";
import {
  CurveGeometryService,
  CurveInterpolationService,
  type IPoint,
  InterpolatedCurve,
  PlotPathBuilder,
} from "@monorepo/core-plot-curve";
import { RectangleBuilder } from "@monorepo/core-plot-shapes";

import { MappingController, type MappingViewport } from "../controllers/mapping-controller.js";
import { type GridLineModel } from "../controllers/grid-controller.js";
import { type SnapResult } from "../controllers/snap-controller.js";
import { PlotRectangle } from "../domain/rectangle.js";
import { CORE_PLOT_THEME } from "../styles/core-plot-style-system.js";
import { Axis } from "./axis.js";
import { AxisTickDensityPolicy } from "./axis-tick-density-policy.js";
import { AxisRange } from "./axis-range.js";
import type { Rectangle2 } from "@monorepo/core-math";

export class CoordinateSystem extends CanvasObject {
  private readonly horizontalAxis: Axis;
  private readonly verticalAxis: Axis;
  private readonly points: IPoint[];
  private readonly rectangles: PlotRectangle[];
  private readonly curves: InterpolatedCurve[];
  private readonly mappingController: MappingController;
  private readonly curveInterpolationService: CurveInterpolationService;
  private readonly curveGeometryService: CurveGeometryService;
  private readonly pathBuilder: PlotPathBuilder;
  private readonly xRange: AxisRange;
  private readonly yRange: AxisRange;
  private readonly tickDensityPolicy: AxisTickDensityPolicy;
  private selectedPointId: string | null = null;
  private lastRenderContext: RenderContext = {
    width: 840,
    height: 520,
    selectedObjectId: null,
    selectedPointId: null,
  };
  private dragStartPointPosition: { x: number; y: number } | null = null;

  public constructor(
    host: ReactiveControllerHost,
    id: string,
    points: readonly IPoint[],
    rectangles: readonly PlotRectangle[] = [],
    xRange = new AxisRange(),
    yRange = new AxisRange(),
    curves: readonly InterpolatedCurve[] = [],
  ) {
    super(id);
    this.points = [...points];
    this.rectangles = [...rectangles];
    this.curves = [...curves];
    this.xRange = xRange;
    this.yRange = yRange;
    this.horizontalAxis = new Axis(`${id}-x-axis`, "horizontal", this.xRange);
    this.verticalAxis = new Axis(`${id}-y-axis`, "vertical", this.yRange);
    this.mappingController = new MappingController(host);
    this.curveInterpolationService = new CurveInterpolationService();
    this.curveGeometryService = new CurveGeometryService();
    this.pathBuilder = new PlotPathBuilder();
    this.tickDensityPolicy = new AxisTickDensityPolicy();
  }

  public override getCapabilities() {
    return {
      clickable: true,
      draggable: true,
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
    this.lastRenderContext = context;
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

    const plottedCurves = this.curves.map((curve) => {
      const cartesianSamples = this.sampleInterpolatedCurve(curve);
      const mappedSamples = this.mapCurveSamplesToSvg(cartesianSamples, context);
      if (mappedSamples.length < 2) {
        return svg``;
      }

      const lineStyle = context.selectedObjectId === this.id
        ? {
            stroke: CORE_PLOT_THEME.colors.routeActive,
            strokeWidth: 3,
            opacity: 0.95,
          }
        : {
            stroke: CORE_PLOT_THEME.colors.textAccent,
            strokeWidth: 2.5,
            opacity: 0.9,
          };

      const pathData = this.pathBuilder.buildPolylinePath(mappedSamples);
      const labelAnchor = mappedSamples[Math.floor(mappedSamples.length * 0.72)] ?? mappedSamples.at(-1);
      return svg`
        <g data-curve-label=${curve.label}>
          <path
            d=${pathData}
            fill="none"
            stroke=${lineStyle.stroke}
            stroke-width=${String(lineStyle.strokeWidth)}
            opacity=${String(lineStyle.opacity)}
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
          ${labelAnchor
            ? svg`
                <text
                  x=${labelAnchor.x + 12}
                  y=${labelAnchor.y - 12}
                  fill=${lineStyle.stroke}
                  font-size="12"
                  font-family=${CORE_PLOT_THEME.typography.fontFamily.ui}
                >
                  ${curve.label}
                </text>
              `
            : svg``}
        </g>
      `;
    });

    const plottedRectangles = this.rectangles.map((rectangle) => {
      const mappedBounds = this.mapCartesianRectangleToSvg(rectangle.bounds, context);
      const rectangleStyle = context.selectedObjectId === this.id
        ? {
            fill: CORE_PLOT_THEME.colors.panelSurfaceSubtle,
            stroke: CORE_PLOT_THEME.colors.routeActive,
            strokeWidth: 2,
            opacity: 1,
          }
        : {
            fill: CORE_PLOT_THEME.colors.panelSurfaceSubtle,
            stroke: CORE_PLOT_THEME.colors.textAccent,
            strokeWidth: 1.5,
            opacity: 1,
          };

      return svg`
        <g data-rectangle-label=${rectangle.label}>
          ${new RectangleBuilder()
            .withRectangle(mappedBounds)
            .withCornerRadius(12)
            .withStyle(rectangleStyle)
            .build()
            .render()}
          <text
            x=${mappedBounds.x + 12}
            y=${mappedBounds.y + 20}
            fill=${rectangleStyle.stroke}
            font-size="12"
            font-family=${CORE_PLOT_THEME.typography.fontFamily.ui}
          >
            ${rectangle.label}
          </text>
        </g>
      `;
    });

    const plottedPoints = this.points.map((point) => {
      const mapped = this.mappingController.mapToSvg(point, this.xRange, this.yRange, viewport);
      const pointIsHighlighted = context.selectedPointId === point.id;
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
        ${plottedCurves}
        ${plottedRectangles}
        ${plottedPoints}
      </g>
    `;
  }

  public override hitTest(context: HitTestContext): boolean {
    const renderContext = {
      width: 840,
      height: 520,
      selectedObjectId: null,
      selectedPointId: null,
    };
    const viewport = this.createViewport(renderContext);
    const pointHit = this.points.some((point) => {
      const mapped = this.mappingController.mapToSvg(point, this.xRange, this.yRange, viewport);
      const dx = context.x - mapped.x;
      const dy = context.y - mapped.y;
      return dx * dx + dy * dy <= 144;
    });
    if (pointHit) {
      return true;
    }

    const hitPoint = new Vector2(context.x, context.y);
    const rectangleHit = this.rectangles.some((rectangle) => {
      const mappedBounds = this.mapCartesianRectangleToSvg(rectangle.bounds, renderContext);
      return new BoundingBox2D(
        new Vector2(mappedBounds.x, mappedBounds.y),
        new Vector2(mappedBounds.x + mappedBounds.width, mappedBounds.y + mappedBounds.height),
      ).contains(hitPoint);
    });
    if (rectangleHit) {
      return true;
    }

    return this.curves.some((curve) => {
      const cartesianSamples = this.sampleInterpolatedCurve(curve);
      const mappedSamples = this.mapCurveSamplesToSvg(cartesianSamples, renderContext);
      if (mappedSamples.length < 2) {
        return false;
      }

      const bounds = new BoundingBox2DBuilder().addMany(mappedSamples).build();
      if (!this.expandBounds(bounds, 10).contains(hitPoint)) {
        return false;
      }

      return this.isPointNearPolyline(hitPoint, mappedSamples, 10);
    });
  }

  public resolvePointSelectionAt(point: { x: number; y: number }, context: RenderContext): string | null {
    const viewport = this.createViewport(context);

    for (let index = this.points.length - 1; index >= 0; index -= 1) {
      const candidate = this.points[index];
      if (candidate === undefined) {
        continue;
      }

      const mapped = this.mappingController.mapToSvg(candidate, this.xRange, this.yRange, viewport);
      const dx = point.x - mapped.x;
      const dy = point.y - mapped.y;
      if (dx * dx + dy * dy <= 144) {
        return candidate.id;
      }
    }

    return null;
  }

  public applyPointSelection(pointId: string | null): void {
    this.selectedPointId = pointId;
  }

  public getSelectedPointId(): string | null {
    return this.selectedPointId;
  }

  public getPointById(pointId: string): IPoint | null {
    return this.points.find((point) => point.id === pointId) ?? null;
  }

  public override onDragStart(): void {
    const point = this.getSelectedMovablePoint();
    this.dragStartPointPosition = point?.position ?? null;
  }

  public override onDragMove(context: { currentX: number; currentY: number }): void {
    const point = this.getSelectedMovablePoint();
    if (point === null) {
      return;
    }

    const cartesian = this.mapSvgToCartesian(
      { x: context.currentX, y: context.currentY },
      this.lastRenderContext,
    );
    point.moveTo(cartesian);
  }

  public override onDragCancel(): void {
    const point = this.getSelectedMovablePoint();
    if (point !== null && this.dragStartPointPosition !== null) {
      point.moveTo(this.dragStartPointPosition);
    }
    this.dragStartPointPosition = null;
  }

  public override onDragEnd(): void {
    this.dragStartPointPosition = null;
  }

  public mapSvgToCartesian(svgPoint: { x: number; y: number }, context: RenderContext): { x: number; y: number } {
    return this.mappingController.mapToCartesian(
      svgPoint,
      this.xRange,
      this.yRange,
      this.createViewport(context),
    );
  }

  public mapCartesianPointToSvg(point: { x: number; y: number }, context: RenderContext): { x: number; y: number } {
    return this.mappingController.mapToSvg(
      point,
      this.xRange,
      this.yRange,
      this.createViewport(context),
    );
  }

  public mapCartesianRectangleToSvg(bounds: Rectangle2, context: RenderContext): Rectangle2 {
    const viewport = this.createViewport(context);
    const bottomLeft = this.mappingController.mapToSvg(
      { x: bounds.x, y: bounds.y },
      this.xRange,
      this.yRange,
      viewport,
    );
    const topRight = this.mappingController.mapToSvg(
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      this.xRange,
      this.yRange,
      viewport,
    );

    return {
      x: Math.min(bottomLeft.x, topRight.x),
      y: Math.min(bottomLeft.y, topRight.y),
      width: Math.abs(topRight.x - bottomLeft.x),
      height: Math.abs(topRight.y - bottomLeft.y),
    };
  }

  public sampleInterpolatedCurve(curve: InterpolatedCurve): readonly Vector2[] {
    return this.curveInterpolationService.sample(curve);
  }

  public mapCurveSamplesToSvg(
    curveSamples: readonly Vector2[],
    context: RenderContext,
  ): readonly Vector2[] {
    const viewport = this.createViewport(context);
    return curveSamples.map((sample) => {
      const mapped = this.mappingController.mapToSvg(
        { x: sample.x, y: sample.y },
        this.xRange,
        this.yRange,
        viewport,
      );
      return new Vector2(mapped.x, mapped.y);
    });
  }

  public buildCurvePathData(curve: InterpolatedCurve, context: RenderContext): string {
    return this.pathBuilder.buildPolylinePath(
      this.mapCurveSamplesToSvg(this.sampleInterpolatedCurve(curve), context),
    );
  }

  public getCurveLength(curve: InterpolatedCurve): number {
    return this.curveGeometryService.length(this.sampleInterpolatedCurve(curve));
  }

  public getCurvePointAt(curve: InterpolatedCurve, t: number): Vector2 | null {
    return this.curveGeometryService.pointAt(this.sampleInterpolatedCurve(curve), t);
  }

  public getCurveTangentAt(curve: InterpolatedCurve, t: number): Vector2 | null {
    return this.curveGeometryService.tangentAt(this.sampleInterpolatedCurve(curve), t);
  }

  public getCurveNormalAt(curve: InterpolatedCurve, t: number): Vector2 | null {
    return this.curveGeometryService.normalAt(this.sampleInterpolatedCurve(curve), t);
  }

  public getCurveHitBounds(
    curve: InterpolatedCurve,
    context: RenderContext,
    tolerance = 10,
  ): BoundingBox2D | null {
    const mappedSamples = this.mapCurveSamplesToSvg(this.sampleInterpolatedCurve(curve), context);
    if (mappedSamples.length === 0) {
      return null;
    }

    return this.expandBounds(new BoundingBox2DBuilder().addMany(mappedSamples).build(), tolerance);
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
    const left = CORE_PLOT_THEME.metrics.plotViewportInsetLeft;
    const top = CORE_PLOT_THEME.metrics.plotViewportInsetTop;
    const right = CORE_PLOT_THEME.metrics.plotViewportInsetRight;
    const bottom = CORE_PLOT_THEME.metrics.plotViewportInsetBottom;

    return {
      left,
      top,
      width: context.width - left - right,
      height: context.height - top - bottom,
    };
  }

  private getSelectedMovablePoint(): IPoint | null {
    if (this.selectedPointId === null) {
      return null;
    }

    const point = this.getPointById(this.selectedPointId);
    if (point === null || point.movable !== true) {
      return null;
    }

    return point;
  }

  private buildTickValues(range: AxisRange, pixelLength: number): readonly number[] {
    return this.tickDensityPolicy.buildVisibleTickValues(range, pixelLength);
  }

  private isPointNearPolyline(
    point: Vector2,
    polyline: readonly Vector2[],
    tolerance: number,
  ): boolean {
    for (let index = 1; index < polyline.length; index += 1) {
      const start = polyline[index - 1];
      const end = polyline[index];
      if (start !== undefined && end !== undefined) {
        const distance = this.distancePointToSegment(point, start, end);
        if (distance <= tolerance) {
          return true;
        }
      }
    }

    return false;
  }

  private distancePointToSegment(point: Vector2, start: Vector2, end: Vector2): number {
    const segment = end.subtract(start);
    const lengthSquared = segment.x * segment.x + segment.y * segment.y;
    if (lengthSquared === 0) {
      return point.distanceTo(start);
    }

    const projection = ((point.x - start.x) * segment.x + (point.y - start.y) * segment.y) / lengthSquared;
    const t = Math.max(0, Math.min(1, projection));
    const nearest = new Vector2(
      start.x + segment.x * t,
      start.y + segment.y * t,
    );
    return point.distanceTo(nearest);
  }

  private expandBounds(bounds: BoundingBox2D, tolerance: number): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(bounds.min.x - tolerance, bounds.min.y - tolerance),
      new Vector2(bounds.max.x + tolerance, bounds.max.y + tolerance),
    );
  }
}
