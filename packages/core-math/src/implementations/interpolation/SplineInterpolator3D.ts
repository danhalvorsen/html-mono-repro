 
import { ISpline } from "../../interpolation/ISpline.js";
import { IInterpolator } from "../../interfaces/IInterpolator.js";
import { Vector3 } from "../Vector3.js";

export class SplineInterpolator3D implements IInterpolator<Vector3> {
  private _elapsed = 0;
  private _current: Vector3;

  constructor(
    private readonly spline: ISpline<Vector3>,
    private readonly duration: number // Total traversal time
  ) {
    this._current = spline.getPointAt(0);
  }
    evaluateAt(scalar: number): Vector3 {
        throw new Error("Method not implemented.");
    }
    advanceBy(delta: number): Vector3 {
        throw new Error("Method not implemented.");
    }
    start!: Vector3;
    end!: Vector3;
    isComplete: boolean = false;
 
  get from(): Vector3 {
    return this.spline.getPointAt(0);
  }

  get to(): Vector3 {
    return this.spline.getPointAt(1);
  }

  get current(): Vector3 {
    return this._current;
  }

  get done(): boolean {
    return this._elapsed >= this.duration;
  }

  next(deltaTime: number): Vector3 {
    this._elapsed = Math.min(this._elapsed + deltaTime, this.duration);
    const t = this._elapsed / this.duration * (this.spline.getPoints().length - 1);
    this._current = this.spline.getPointAt(t);
    return this._current;
  }

  reset(): void {
    this._elapsed = 0;
    this._current = this.spline.getPointAt(0);
  }
}
