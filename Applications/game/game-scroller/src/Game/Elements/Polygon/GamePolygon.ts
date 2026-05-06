import type { Point } from '@monorepo/core-math';
import {
  html,
  LitElement,
  type SVGTemplateResult,
  type TemplateResult
} from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SvgPolygon } from './SvgPolygon';
 
export interface ISvgTemplate {
  readonly svg: SVGTemplateResult;
}

export interface IPolygon {
  readonly points: readonly Point[];
}

export class Polygon implements IPolygon {
  readonly #points: readonly Point[];

  public constructor(points: readonly Point[]) {
    this.#points = points.map(copyPoint);
  }

  public get points(): readonly Point[] {
    return this.#points.map(copyPoint);
  }
}

export type SvgPolygonStyle = {
  readonly fill?: string;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly strokeDasharray?: string;
  readonly closed?: boolean;
};

@customElement('game-polygon')
export class GamePolygon extends LitElement {
  @property({ attribute: false })
  public polygon: ISvgTemplate = new SvgPolygon(new Polygon([]));

  @property({ type: Number })
  public width = 800;

  @property({ type: Number })
  public height = 600;

  protected override render(): TemplateResult {
    return html`
      <svg
        width=${this.width}
        height=${this.height}
        viewBox=${`0 0 ${this.width} ${this.height}`}
        xmlns="http://www.w3.org/2000/svg"
        style="overflow: visible;"
      >
        ${this.polygon.svg}
      </svg>
    `;
  }
}

function copyPoint(point: Point): Point {
  return {
    x: point.x,
    y: point.y
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'game-polygon': GamePolygon;
  }
}
