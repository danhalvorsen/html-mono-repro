import { svg, type SVGTemplateResult } from 'lit';
import type { Triangle } from '@monorepo/game-primetives';
import type { ISvgTemplate } from '../ISvgTemplate.js';
import type { SvgShapeStyle } from '../SvgShapeStyle.js';

export class SvgTriangle implements ISvgTemplate {
  public constructor(
    private readonly triangle: Triangle,
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
    return [this.triangle.a, this.triangle.b, this.triangle.c]
      .map((point) => `${point.x},${point.y}`)
      .join(' ');
  }
}
