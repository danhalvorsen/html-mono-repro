import type { IGridShape } from "./IGridShape";
import type { ILineShape } from "./ILineShape";
import type { IShapeGroup } from "./IShapeGroup";

export interface ICoordinateSystemShape extends IShapeGroup {
    readonly grid: IGridShape;
    readonly xAxis: ILineShape;
    readonly yAxis: ILineShape;
}
