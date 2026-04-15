import type { TemplateResult } from "lit";
import type { SvgStyle } from "./svg-style.js";

import type { IStylable } from "./istylable.js";

export interface IShape<TShape> extends IStylable<TShape, SvgStyle> {
  render(): TemplateResult;
}
