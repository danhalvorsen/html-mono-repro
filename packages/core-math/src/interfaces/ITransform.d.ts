import { IMatrix } from './IMatrix.js';
import { Point2, Point3 } from './IPoint.js';
export interface ITransform {
    translate(offset: Point2 | Point3): this;
    rotate(angleInRadians: number): this;
    scale(sx: number, sy: number): this;
    setFrom(matrix: IMatrix): this;
    getMatrix(): IMatrix;
}
//# sourceMappingURL=ITransform.d.ts.map