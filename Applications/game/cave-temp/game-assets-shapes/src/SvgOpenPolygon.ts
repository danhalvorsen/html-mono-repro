import { svg, type SVGTemplateResult } from 'lit';
import type { ISvgTemplate } from './ISvgTemplate.js';
import type { Polygon } from './Polygon.js';
import type { SvgShapeStyle } from './SvgShapeStyle.js';

export class SvgOpenPolygon implements ISvgTemplate {
  public constructor(
    private readonly polygon: Polygon,
    private readonly style: SvgShapeStyle = {},
  ) {}

  public get svg(): SVGTemplateResult {
    return svg`
      <polyline
        points=${this.toPointsAttribute()}
        fill=${this.style.fill ?? 'none'}
        stroke=${this.style.stroke ?? 'currentColor'}
        stroke-width=${this.style.strokeWidth ?? 1}
        stroke-dasharray=${this.style.strokeDasharray ?? ''}
      ></polyline>
    `;
  }

  private toPointsAttribute(): string {
    return this.polygon.points
      .map(point => `${point.x},${point.y}`)
      .join(' ');
  }
}
