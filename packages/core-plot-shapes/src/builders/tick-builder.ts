import type { Point2 } from "@monorepo/core-math";

import type { Builder } from "./builder.js";
import { TickSvg } from "../svg/tick-svg.js";
import { SvgLine } from "../svg/svg-line.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class TickBuilder implements Builder<TickSvg> {
  private line: SvgLine = new SvgLine({ x: 0, y: 0 }, { x: 0, y: 0 }, Object.freeze({}));
  private labelPosition: Point2 = Object.freeze({ x: 0, y: 0 });
  private label = "";
  private anchor: "start" | "middle" | "end" = "middle";
  private style: Readonly<SvgStyle> = Object.freeze({
    fill: "currentColor",
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 400,
    visible: true,
  });

  public withLine(line: SvgLine): TickBuilder {
    const next = new TickBuilder();
    next.line = line;
    next.labelPosition = this.labelPosition;
    next.label = this.label;
    next.anchor = this.anchor;
    next.style = this.style;
    return next;
  }

  public withLabelPosition(labelPosition: Point2): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = Object.freeze({ ...labelPosition });
    next.label = this.label;
    next.anchor = this.anchor;
    next.style = this.style;
    return next;
  }

  public withLabel(label: string): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = this.labelPosition;
    next.label = label;
    next.anchor = this.anchor;
    next.style = this.style;
    return next;
  }

  public withAnchor(anchor: "start" | "middle" | "end"): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = this.labelPosition;
    next.label = this.label;
    next.anchor = anchor;
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = this.labelPosition;
    next.label = this.label;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public withFill(fill: string): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = this.labelPosition;
    next.label = this.label;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, fill });
    return next;
  }

  public withFontFamily(fontFamily: string): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = this.labelPosition;
    next.label = this.label;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, fontFamily });
    return next;
  }

  public withFontSize(fontSize: number): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = this.labelPosition;
    next.label = this.label;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, fontSize });
    return next;
  }

  public withFontWeight(fontWeight: string | number): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = this.labelPosition;
    next.label = this.label;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, fontWeight });
    return next;
  }

  public withVisibility(visible: boolean): TickBuilder {
    const next = new TickBuilder();
    next.line = this.line;
    next.labelPosition = this.labelPosition;
    next.label = this.label;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, visible });
    return next;
  }

  public build(): TickSvg {
    return new TickSvg(this.line, this.labelPosition, this.label, this.anchor, this.style);
  }
}
