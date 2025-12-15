import { Vector3 } from "three";
import { IInterpolator } from "../interfaces/IInterpolator.js";
 
export class LinearInterpolator3D implements IInterpolator<Vector3> {
  private _elapsed = 0;
  private _current: Vector3;

  constructor(
    public readonly from: Vector3,
    public readonly to: Vector3,
    private readonly duration: number
  ) {
    this._current = from.clone();
  }

  get start(): Vector3 {
    return this.from;
  }

  get end(): Vector3 {
    return this.to;
  }

  get isComplete(): boolean {
    return this.done;
  }

  evaluateAt(scalar: number): Vector3 {
    return this.from.clone().lerp(this.to, scalar);
  }

  advanceBy(delta: number): Vector3 {
    this._elapsed = Math.min(this._elapsed + delta, this.duration);
    const t = this._elapsed / this.duration;
    this._current = this.from.clone().lerp(this.to, t);
    return this._current;
  }

  get current(): Vector3 {
    return this._current;
  }

  get done(): boolean {
    return this._elapsed >= this.duration;
  }

  next(deltaTime: number): Vector3 {
    this._elapsed = Math.min(this._elapsed + deltaTime, this.duration);
    const t = this._elapsed / this.duration;
    this._current = this.from.clone().lerp(this.to, t);
    return this._current;
  }

  reset(): void {
    this._elapsed = 0;
    this._current = this.from.clone();
  }
}
