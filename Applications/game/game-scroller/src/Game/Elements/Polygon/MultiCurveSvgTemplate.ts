import type { Point2 } from '@monorepo/core-math';
import { type SVGTemplateResult, svg } from 'lit';
import { type ISvgTemplate, Polygon } from './GamePolygon';
import { SvgOpenPolygon } from './SvgOpenPolygon';
import { SvgPolygon } from './SvgPolygon';

export type ReferenceCurveRenderStyle = 'solid' | 'dashed';

export class MultiCurveSvgTemplate implements ISvgTemplate {
  readonly #reference: readonly Point2[];
  readonly #upper: readonly Point2[];
  readonly #lower: readonly Point2[];
  readonly #showReferenceCurve: boolean;
  readonly #referenceCurveRenderStyle: ReferenceCurveRenderStyle;
  readonly #closeCurvesToBounds: boolean;
  readonly #boundsWidth: number;
  readonly #boundsHeight: number;

  public constructor(
    reference: readonly Point2[],
    upper: readonly Point2[],
    lower: readonly Point2[],
    options?: {
      readonly showReferenceCurve?: boolean;
      readonly referenceCurveRenderStyle?: ReferenceCurveRenderStyle;
      readonly closeCurvesToBounds?: boolean;
      readonly boundsWidth?: number;
      readonly boundsHeight?: number;
    }
  ) {
    this.#reference = reference;
    this.#upper = upper;
    this.#lower = lower;
    this.#showReferenceCurve = options?.showReferenceCurve ?? true;
    this.#referenceCurveRenderStyle = options?.referenceCurveRenderStyle ?? 'solid';
    this.#closeCurvesToBounds = options?.closeCurvesToBounds ?? false;
    this.#boundsWidth = options?.boundsWidth ?? 1500;
    this.#boundsHeight = options?.boundsHeight ?? 300;
  }

  public get svg(): SVGTemplateResult {
    const upper = this.#closeCurvesToBounds
      ? this.#toUpperClosedPolygon(this.#upper, '#3b271b', '#5a3a2a')
      : this.#toCurve(this.#upper, '#22c55e');
    const reference = this.#toCurve(
      this.#reference,
      '#0ea5e9',
      this.#referenceCurveRenderStyle === 'dashed' ? '8 6' : undefined
    );
    const lower = this.#closeCurvesToBounds
      ? this.#toLowerClosedPolygon(this.#lower, '#2e1f15', '#6a4431')
      : this.#toCurve(this.#lower, '#ef4444');

    return svg`
      ${this.#defs}
      ${upper.svg}
      ${this.#showReferenceCurve ? reference.svg : null}
      ${lower.svg}
    `;
  }

  #toCurve(points: readonly Point2[], stroke: string, strokeDasharray?: string): SvgOpenPolygon {
    return new SvgOpenPolygon(new Polygon(points), {
      fill: 'none',
      stroke,
      strokeWidth: 2,
      strokeDasharray
    });
  }

  #toUpperClosedPolygon(points: readonly Point2[], fill: string, stroke: string): SvgPolygon {
    const bounds = this.#resolveBounds(points);
    const polygonPoints: Point2[] = [
      ...points,
      { x: bounds.maxX, y: 0 },
      { x: bounds.minX, y: 0 }
    ];
    return new SvgPolygon(new Polygon(polygonPoints), {
      fill,
      stroke,
      strokeWidth: 1
    });
  }

  #toLowerClosedPolygon(points: readonly Point2[], fill: string, stroke: string): SvgPolygon {
    const bounds = this.#resolveBounds(points);
    const polygonPoints: Point2[] = [
      ...points,
      { x: bounds.maxX, y: this.#boundsHeight },
      { x: bounds.minX, y: this.#boundsHeight }
    ];
    return new SvgPolygon(new Polygon(polygonPoints), {
      fill,
      stroke,
      strokeWidth: 1
    });
  }

  #resolveBounds(points: readonly Point2[]): { minX: number; maxX: number } {
    if (points.length === 0) {
      return { minX: 0, maxX: this.#boundsWidth };
    }

    const xs = points.map(point => point.x);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs)
    };
  }

  get #defs(): SVGTemplateResult {
    return svg``;
  }
}
