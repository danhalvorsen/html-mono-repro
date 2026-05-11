import { svg, type SVGTemplateResult } from 'lit';
import type { Square } from '@monorepo/game-primetives';
import type { ISvgTemplate } from '../ISvgTemplate.js';
import type { SvgShapeStyle } from '../SvgShapeStyle.js';

export class SvgSquare implements ISvgTemplate {
  public constructor(
    private readonly square: Square,
    private readonly style: SvgShapeStyle = {},
  ) {}

  public get svg(): SVGTemplateResult {
    return svg`
      <rect
        x=${this.square.topLeft.x}
        y=${this.square.topLeft.y}
        width=${this.square.size}
        height=${this.square.size}
        fill=${this.style.fill ?? 'none'}
        stroke=${this.style.stroke ?? 'currentColor'}
        stroke-width=${this.style.strokeWidth ?? 1}
        stroke-dasharray=${this.style.strokeDasharray ?? ''}
      ></rect>
    `;
  }
}
