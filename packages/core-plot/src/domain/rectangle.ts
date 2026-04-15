import type { Rectangle2 } from "@monorepo/core-math";

export class PlotRectangle {
  public readonly bounds: Rectangle2;
  public readonly label: string;

  public constructor(bounds: Rectangle2, label: string) {
    this.bounds = Object.freeze({ ...bounds });
    this.label = label;
  }
}
