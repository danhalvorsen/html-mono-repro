import type { IFillStyle } from "./IFillStyle.js";
import type { IStrokeStyle } from "./IStrokeStyle.js";

export interface IStyle {
  readonly stroke?: Readonly<IStrokeStyle>;
  readonly fill?: Readonly<IFillStyle>;
  readonly opacity?: number;
}
