import type { Point } from "@monorepo/core-math";
import type { IShape } from "../../Shape/IShape";
import type { IVertex } from '../Vertex/IVertex';

export interface ILineShape extends IShape {
    readonly kind: 'line';
    readonly start: Point;
    readonly end: Point;
    readonly startVertex?: IVertex;
    readonly endVertex?: IVertex;
}
