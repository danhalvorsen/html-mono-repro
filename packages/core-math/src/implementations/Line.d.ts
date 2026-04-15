import { ILine } from "../interfaces/ILine.js";
import { IVector } from "../interfaces/IVector.js";
export declare class Line<T extends IVector<T>> implements ILine<T> {
    A: T;
    B: T;
    constructor(A: T, B: T);
    direction(): T;
    length(): number;
    getPoint(t: number): T;
    closestPointTo(point: T): T;
}
//# sourceMappingURL=Line.d.ts.map