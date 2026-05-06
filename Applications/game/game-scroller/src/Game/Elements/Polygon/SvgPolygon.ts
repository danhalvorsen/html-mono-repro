import { type SVGTemplateResult, svg, nothing } from 'lit';
import type { ISvgTemplate, IPolygon, SvgPolygonStyle } from './GamePolygon';


export class SvgPolygon implements ISvgTemplate {
  readonly #polygon: IPolygon;
  readonly #fill: string;
  readonly #stroke: string;
  readonly #strokeWidth: number;
  readonly #strokeDasharray: string | null;
  readonly #closed: boolean;

  public constructor(
    polygon: IPolygon,
    style: SvgPolygonStyle = {}
  ) {
    this.#polygon = polygon;
    this.#fill = style.fill ?? 'none';
    this.#stroke = style.stroke ?? 'black';
    this.#strokeWidth = style.strokeWidth ?? 1;
    this.#strokeDasharray = style.strokeDasharray ?? null;
    this.#closed = style.closed ?? true;
  }

  public get svg(): SVGTemplateResult {
    if (!this.#closed) {
      return svg`
        <polyline
          points=${this.#toSvgPointList()}
          fill=${this.#fill}
          stroke=${this.#stroke}
          stroke-width=${this.#strokeWidth}
          stroke-dasharray=${this.#strokeDasharray ?? nothing}
        ></polyline>
      `;
    }

    return svg`
      <polygon
        points=${this.#toSvgPointList()}
        fill=${this.#fill}
        stroke=${this.#stroke}
        stroke-width=${this.#strokeWidth}
        stroke-dasharray=${this.#strokeDasharray ?? nothing}
      ></polygon>
    `;
  }

  #toSvgPointList(): string {
    return this.#polygon.points
      .map(point => `${point.x},${point.y}`)
      .join(' ');
  }
}
