import type { IGridShape } from "../Grid/IGridShape";
import { ShapeGroup } from "../Group/ShapeGroup";
import type { IAxis } from "./Axis/IAxis";
import type { ICoordinateSystemShape } from "./ICoordinateSystemShape";

export class CoordinateSystemShape extends ShapeGroup implements ICoordinateSystemShape {
  public constructor(
    public readonly grid: IGridShape,
    public readonly xAxis: IAxis,
    public readonly yAxis: IAxis,
    id?: string
  ) {
    super([grid, xAxis, yAxis], { token: 'base' }, id);
  }
}
