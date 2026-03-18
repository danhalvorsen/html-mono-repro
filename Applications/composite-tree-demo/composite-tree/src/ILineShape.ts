import type { IShape, IPoint, IVertex } from "./shape-model";


export interface ILineShape extends IShape {
    readonly kind: 'line';
    readonly start: IPoint;
    readonly end: IPoint;
    readonly startVertex?: IVertex;
    readonly endVertex?: IVertex;
}
