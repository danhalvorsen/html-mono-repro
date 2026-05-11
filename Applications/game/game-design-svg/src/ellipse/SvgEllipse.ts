import { svg, type SVGTemplateResult } from 'lit';
import type { Ellipse } from '@monorepo/game-primetives';
import type { ISvgTemplate } from '../ISvgTemplate.js';
import type { SvgShapeStyle } from '../SvgShapeStyle.js';

export class SvgEllipse implements ISvgTemplate {
  public constructor(
    private readonly ellipse: Ellipse,
    private readonly style: SvgShapeStyle = {},
  ) {}

  public get svg(): SVGTemplateResult {
    return svg`
      <ellipse
        cx=${this.ellipse.center.x}
        cy=${this.ellipse.center.y}
        rx=${this.ellipse.radiusX}
        ry=${this.ellipse.radiusY}
        fill=${this.style.fill ?? 'none'}
        stroke=${this.style.stroke ?? 'currentColor'}
        stroke-width=${this.style.strokeWidth ?? 1}
        stroke-dasharray=${this.style.strokeDasharray ?? ''}
      ></ellipse>
    `;
  }
}
