import { Vector3 } from '../implementations/Vector3.js';
import { ISpline } from './ISpline.js';
export declare class CatmullRomSpline3D implements ISpline<Vector3> {
    private points;
    constructor(points: Vector3[]);
    getPoints(): Vector3[];
    getPointAt(t: number): Vector3;
    getLength(): number;
    draw2D(ctx: CanvasRenderingContext2D, steps?: number): void;
}
//# sourceMappingURL=CatmullRomSpline3D.d.ts.map