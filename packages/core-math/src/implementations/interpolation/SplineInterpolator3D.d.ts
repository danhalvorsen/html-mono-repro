import { ISpline } from "../../interpolation/ISpline.js";
import { IInterpolator } from "../../interfaces/IInterpolator.js";
import { Vector3 } from "../Vector3.js";
export declare class SplineInterpolator3D implements IInterpolator<Vector3> {
    private readonly spline;
    private readonly duration;
    private _elapsed;
    private _current;
    constructor(spline: ISpline<Vector3>, duration: number);
    evaluateAt(scalar: number): Vector3;
    advanceBy(delta: number): Vector3;
    start: Vector3;
    end: Vector3;
    isComplete: boolean;
    get from(): Vector3;
    get to(): Vector3;
    get current(): Vector3;
    get done(): boolean;
    next(deltaTime: number): Vector3;
    reset(): void;
}
//# sourceMappingURL=SplineInterpolator3D.d.ts.map