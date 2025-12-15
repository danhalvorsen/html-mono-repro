import { Vector3 } from "../implementations/Vector3.js";
import { IInterpolator } from "../interfaces/IInterpolator.js";
import { ISpline } from "./ISpline.js";

export class SplineInterpolator3D implements IInterpolator<Vector3> {
  private _elapsed = 0;
  private _current: Vector3;

  constructor(
    private readonly spline: ISpline<Vector3>,
    private readonly duration: number // Total traversal time
  ) {
    this._current = spline.getPointAt(0);
  }

  get start(): Vector3 {
    return this.spline.getPointAt(0);
  }

  get end(): Vector3 {
    return this.spline.getPointAt(1);
  }

  get current(): Vector3 {
    return this._current;
  }

  get isComplete(): boolean {
    return this._elapsed >= this.duration;
  }

  evaluateAt(scalar: number): Vector3 {
    throw new Error("Method not implemented.");
  }

  advanceBy(delta: number): Vector3 {
    throw new Error("Method not implemented.");
  }

  reset(): void {
    throw new Error("Method not implemented.");
  }
}
