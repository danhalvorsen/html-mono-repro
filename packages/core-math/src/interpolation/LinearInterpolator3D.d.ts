import { Vector3 } from "three";
import { IInterpolator } from "../interfaces/IInterpolator.js";
export declare class LinearInterpolator3D implements IInterpolator<Vector3> {
    readonly from: Vector3;
    readonly to: Vector3;
    private readonly duration;
    private _elapsed;
    private _current;
    constructor(from: Vector3, to: Vector3, duration: number);
    get start(): Vector3;
    get end(): Vector3;
    get isComplete(): boolean;
    evaluateAt(scalar: number): Vector3;
    advanceBy(delta: number): Vector3;
    get current(): Vector3;
    get done(): boolean;
    next(deltaTime: number): Vector3;
    reset(): void;
}
//# sourceMappingURL=LinearInterpolator3D.d.ts.map