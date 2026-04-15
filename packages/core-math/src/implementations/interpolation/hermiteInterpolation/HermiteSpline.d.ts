import { IControlPointStrategy } from "../../../interfaces/IControlPointStrategy.js";
import { IInterpolationStrategy } from "../../../interfaces/IInterpolationStrategy.js";
import { ISpline } from "../../../interpolation/ISpline.js";
export declare class HermiteSpline<T> implements ISpline<T> {
    readonly controlPoints: T[];
    private readonly tangentStrategy;
    private readonly interpolationStrategy;
    readonly isClosed: boolean;
    constructor(controlPoints: T[], tangentStrategy: IControlPointStrategy<T>, interpolationStrategy: IInterpolationStrategy<T, number>, isClosed?: boolean);
    get domain(): [number, number];
    at(t: number): T;
    getPointAt(t: number): T;
    getLength(): number;
    getPoints(): T[];
}
//# sourceMappingURL=HermiteSpline.d.ts.map