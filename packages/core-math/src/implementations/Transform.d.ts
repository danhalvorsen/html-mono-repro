import { IMatrix } from '../interfaces/IMatrix.js';
import { Vector2 } from './Vector2.js';
import { Vector3 } from './Vector3.js';
import { ITransform } from '../interfaces/ITransform.js';
export declare class Transform implements ITransform {
    private matrix;
    constructor(base?: IMatrix);
    translate(offset: Vector2 | Vector3): this;
    rotate(angle: number): this;
    scale(sx: number, sy: number): this;
    setFrom(matrix: IMatrix): this;
    getMatrix(): IMatrix;
    transformVec2(v: Vector2): Vector2;
    transformVec3(v: Vector3): Vector3;
}
export declare class ParameterT {
    readonly value: number;
    constructor(value: number);
}
//# sourceMappingURL=Transform.d.ts.map