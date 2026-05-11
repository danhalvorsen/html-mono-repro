import { svg, type SVGTemplateResult } from 'lit';
import type { Segment } from '@monorepo/game-primetives';
import type { ISvgTemplate } from '../ISvgTemplate.js';
import type { SvgShapeStyle } from '../SvgShapeStyle.js';

export class SvgSegment implements ISvgTemplate {
  public constructor(
    private readonly segment: Segment,
    private readonly style: SvgShapeStyle = {},
  ) {}

  public get svg(): SVGTemplateResult {
    return svg`
      <line
        x1=${this.segment.start.x}
        y1=${this.segment.start.y}
        x2=${this.segment.end.x}
        y2=${this.segment.end.y}
        stroke=${this.style.stroke ?? 'currentColor'}
        stroke-width=${this.style.strokeWidth ?? 1}
        stroke-dasharray=${this.style.strokeDasharray ?? ''}
      ></line>
    `;
  }
}
