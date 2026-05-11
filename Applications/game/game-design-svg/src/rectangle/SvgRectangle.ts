import { svg, type SVGTemplateResult } from 'lit';
import type { Rectangle } from '@monorepo/game-primetives';
import type { ISvgTemplate } from '../ISvgTemplate.js';
import type { SvgShapeStyle } from '../SvgShapeStyle.js';

export class SvgRectangle implements ISvgTemplate {
  public constructor(
    private readonly rectangle: Rectangle,
    private readonly style: SvgShapeStyle = {},
  ) {}

  public get svg(): SVGTemplateResult {
    return svg`
      <rect
        x=${this.rectangle.topLeft.x}
        y=${this.rectangle.topLeft.y}
        width=${this.rectangle.width}
        height=${this.rectangle.height}
        fill=${this.style.fill ?? 'none'}
        stroke=${this.style.stroke ?? 'currentColor'}
        stroke-width=${this.style.strokeWidth ?? 1}
        stroke-dasharray=${this.style.strokeDasharray ?? ''}
      ></rect>
    `;
  }
}
