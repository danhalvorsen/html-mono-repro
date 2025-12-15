import { ILine } from "../interfaces/ILine.js";
import { IVector } from "../interfaces/IVector.js";

export class Line<T extends IVector<T>> implements ILine<T>{
  constructor(
    public A: T,
    public B: T
  ) {}

  direction(): T {
    return this.B.subtract(this.A).normalize();
  }

  length(): number {
    return this.A.distanceTo(this.B);
  }

  getPoint(t: number): T {
    return this.A.lerp(this.B, t);
  }

  closestPointTo(point: T): T {
    const AB = this.B.subtract(this.A);
    const AP = point.subtract(this.A);
    const abLengthSquared = AB.dot(AB);

    if (abLengthSquared === 0) return this.A.clone(); // Line is a point

    const t = AP.dot(AB) / abLengthSquared;
    const clampedT = Math.max(0, Math.min(1, t));
    return this.getPoint(clampedT);
  }
}
