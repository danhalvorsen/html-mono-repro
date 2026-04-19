import type { Point2 } from "@monorepo/core-math";

import type { Builder } from "./builder.js";
import { SvgLabel } from "../svg/svg-label.js";
import type { SvgStyle } from "../svg/svg-style.js";

export class LabelBuilder implements Builder<SvgLabel> {
  private position: Point2 = Object.freeze({ x: 0, y: 0 });
  private text = "";
  private anchor: "start" | "middle" | "end" = "start";
  private style: Readonly<SvgStyle> = Object.freeze({
    fill: "currentColor",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 400,
    visible: true,
  });

  public withPosition(position: Point2): LabelBuilder {
    const next = new LabelBuilder();
    next.position = Object.freeze({ ...position });
    next.text = this.text;
    next.anchor = this.anchor;
    next.style = this.style;
    return next;
  }

  public withText(text: string): LabelBuilder {
    const next = new LabelBuilder();
    next.position = this.position;
    next.text = text;
    next.anchor = this.anchor;
    next.style = this.style;
    return next;
  }

  public withAnchor(anchor: "start" | "middle" | "end"): LabelBuilder {
    const next = new LabelBuilder();
    next.position = this.position;
    next.text = this.text;
    next.anchor = anchor;
    next.style = this.style;
    return next;
  }

  public withStyle(style: Readonly<SvgStyle>): LabelBuilder {
    const next = new LabelBuilder();
    next.position = this.position;
    next.text = this.text;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...style });
    return next;
  }

  public withFill(fill: string): LabelBuilder {
    const next = new LabelBuilder();
    next.position = this.position;
    next.text = this.text;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, fill });
    return next;
  }

  public withFontFamily(fontFamily: string): LabelBuilder {
    const next = new LabelBuilder();
    next.position = this.position;
    next.text = this.text;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, fontFamily });
    return next;
  }

  public withFontSize(fontSize: number): LabelBuilder {
    const next = new LabelBuilder();
    next.position = this.position;
    next.text = this.text;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, fontSize });
    return next;
  }

  public withFontWeight(fontWeight: string | number): LabelBuilder {
    const next = new LabelBuilder();
    next.position = this.position;
    next.text = this.text;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, fontWeight });
    return next;
  }

  public withVisibility(visible: boolean): LabelBuilder {
    const next = new LabelBuilder();
    next.position = this.position;
    next.text = this.text;
    next.anchor = this.anchor;
    next.style = Object.freeze({ ...this.style, visible });
    return next;
  }

  public build(): SvgLabel {
    return new SvgLabel(this.position, this.text, this.anchor, this.style);
  }
}
