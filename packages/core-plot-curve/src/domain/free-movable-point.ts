import { type PointPosition } from "./ipoint.js";
import { Point } from "./point.js";

export class FreeMovablePoint extends Point {
  public override get movable(): boolean {
    return true;
  }

  public override moveTo(position: PointPosition): boolean {
    this.setPosition(position);
    return true;
  }
}
