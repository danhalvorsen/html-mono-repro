import type { IEllipseShape } from "./Shapes/Circle/IEllipseShape";
import type { IGridShape } from "./Shapes/Grid/IGridShape";
import type { ILineShape } from "./Shapes/Line/ILineShape";
import type { IShapeGroup } from "./Shapes/Group/IShapeGroup";
import type { ICircleShape } from "./shape-model";
import type { IVertex } from './Shapes/Vertex/IVertex';
import type { IPolygon } from "./Shapes/Polygon/IPolygon";
import type { IAxis } from "./Shapes/CoordinateSystem/Axis/IAxis";

export type DrawableShape = ICircleShape |
    IEllipseShape |
    ILineShape |
    IAxis |
    IPolygon |
    IVertex |
    IGridShape |
    IShapeGroup;
