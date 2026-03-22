import type { IGridShape } from "../Grid/IGridShape";
import type { IAxis } from "./Axis/IAxis";
import type { IShapeGroup } from "../Group/IShapeGroup";

export interface ICoordinateSystemShape extends IShapeGroup {
    readonly grid: IGridShape;
    readonly xAxis: IAxis;
    readonly yAxis: IAxis;
}
