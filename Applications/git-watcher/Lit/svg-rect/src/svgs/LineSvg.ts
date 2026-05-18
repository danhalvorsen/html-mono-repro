// LineSvg.ts
import { SvgElement } from "./SvgElement";

export class LineSvg extends SvgElement<SVGLineElement> {
  constructor(x1: number, y1: number, x2: number, y2: number) {
    super("line");
    this.setPoints(x1, y1, x2, y2).stroke("currentColor");
  }

  setPoints(x1: number, y1: number, x2: number, y2: number): this {
    return this
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2);
  }

  dashed(pattern: string): this {
    return this.attr("stroke-dasharray", pattern);
  }

  major(): this {
    return this.opacity(0.25).width(0.6);
  }

  minor(): this {
    return this.opacity(0.12).width(0.35);
  }
}