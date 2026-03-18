import type { IEllipseShape } from "./IEllipseShape";
import type { IGridShape } from "./IGridShape";
import type { ILineShape } from "./ILineShape";
import type { IShapeGroup } from "./IShapeGroup";
import type { ICircleShape, IPolygon, IVertex } from "./shape-model";


export type DrawableShape = ICircleShape |
    IEllipseShape |
    ILineShape |
    IPolygon |
    IVertex |
    IGridShape |
    IShapeGroup;
