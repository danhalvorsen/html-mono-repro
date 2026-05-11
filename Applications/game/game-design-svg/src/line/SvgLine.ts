import { svg, type SVGTemplateResult } from 'lit';
import type { Line } from '@monorepo/game-primetives';
import type { ISvgTemplate } from '../ISvgTemplate.js';
import type { SvgShapeStyle } from '../SvgShapeStyle.js';

export class SvgLine implements ISvgTemplate {
  public constructor(
    private readonly line: Line,
    private readonly style: SvgShapeStyle = {},
  ) {}

  public get svg(): SVGTemplateResult {
    return svg`
      <line
        x1=${this.line.start.x}
        y1=${this.line.start.y}
        x2=${this.line.end.x}
        y2=${this.line.end.y}
        stroke=${this.style.stroke ?? 'currentColor'}
        stroke-width=${this.style.strokeWidth ?? 1}
        stroke-dasharray=${this.style.strokeDasharray ?? ''}
      ></line>
    `;
  }
}
