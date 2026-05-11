import { svg, type SVGTemplateResult } from 'lit';
import type { Polygon } from '@monorepo/game-primetives';
import type { ISvgTemplate } from '../ISvgTemplate.js';
import type { SvgShapeStyle } from '../SvgShapeStyle.js';

export class SvgPolygon implements ISvgTemplate {
  public constructor(
    private readonly polygon: Polygon,
    private readonly style: SvgShapeStyle = {},
  ) {}

  public get svg(): SVGTemplateResult {
    return svg`
      <polygon
        points=${this.toPointsAttribute()}
        fill=${this.style.fill ?? 'none'}
        stroke=${this.style.stroke ?? 'currentColor'}
        stroke-width=${this.style.strokeWidth ?? 1}
        stroke-dasharray=${this.style.strokeDasharray ?? ''}
      ></polygon>
    `;
  }

  private toPointsAttribute(): string {
    return this.polygon.points
      .map(point => `${point.x},${point.y}`)
      .join(' ');
  }
}
