import { IStrokeStyle } from "./IStrokeStyle";

export interface IFillStrokeStyle extends IStrokeStyle {
  readonly fill: string;
}
