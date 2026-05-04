import type { Point2 } from '@monorepo/core-math';
import { type SVGTemplateResult, svg } from 'lit';
import { type ISvgTemplate, Polygon, SvgOpenPolygon } from '../../GamePolygon';

export class MultiCurveSvgTemplate implements ISvgTemplate {
  readonly #reference: readonly Point2[];
  readonly #upper: readonly Point2[];
  readonly #lower: readonly Point2[];

  public constructor(
    reference: readonly Point2[],
    upper: readonly Point2[],
    lower: readonly Point2[]
  ) {
    this.#reference = reference;
    this.#upper = upper;
    this.#lower = lower;
  }

  public get svg(): SVGTemplateResult {
    const upper = this.#toCurve(this.#upper, '#22c55e');
    const reference = this.#toCurve(this.#reference, '#0ea5e9');
    const lower = this.#toCurve(this.#lower, '#ef4444');

    return svg`
      ${upper.svg}
      ${reference.svg}
      ${lower.svg}
    `;
  }

  #toCurve(points: readonly Point2[], stroke: string): SvgOpenPolygon {
    return new SvgOpenPolygon(new Polygon(points), {
      fill: 'none',
      stroke,
      strokeWidth: 2
    });
  }
}
