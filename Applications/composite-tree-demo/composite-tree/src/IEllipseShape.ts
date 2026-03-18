import type { IShape, IPoint } from "./shape-model";


export interface IEllipseShape extends IShape {
    readonly kind: 'ellipse';
    readonly center: IPoint;
    readonly radiusX: number;
    readonly radiusY: number;
}
