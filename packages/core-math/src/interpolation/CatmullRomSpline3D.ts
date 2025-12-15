import { Vector3 } from '../implementations/Vector3.js';
import { ISpline } from './ISpline.js';

export class CatmullRomSpline3D implements ISpline<Vector3> {
  constructor(private points: Vector3[]) {
    if (points.length < 4) {
      throw new Error('Catmull-Rom spline needs at least 4 points.');
    }
  }
  getPoints(): Vector3[] {
    throw new Error('Method not implemented.');
  }

  getPointAt(t: number): Vector3 {
    const numSegments = this.points.length - 3;
    const segT = t * numSegments;
    const segIndex = Math.min(Math.floor(segT), numSegments - 1);
    const localT = segT - segIndex;

    const p0 = this.points[segIndex];
    const p1 = this.points[segIndex + 1];
    const p2 = this.points[segIndex + 2];
    const p3 = this.points[segIndex + 3];

    const t2 = localT * localT;
    const t3 = localT * t2;

    return p0
      .clone()
      .scale(-0.5 * t3 + t2 - 0.5 * localT)
      .add(p1.clone().scale(1.5 * t3 - 2.5 * t2 + 1.0))
      .add(p2.clone().scale(-1.5 * t3 + 2.0 * t2 + 0.5 * localT))
      .add(p3.clone().scale(0.5 * t3 - 0.5 * t2));
  }

  getLength(): number {
    return this.points.length - 3;
  }

  draw2D(ctx: CanvasRenderingContext2D, steps: number = 100): void {
    if (this.points.length < 4) return;
    ctx.beginPath();
    const p = this.getPointAt(0);
    ctx.moveTo(p.x, p.y);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const pt = this.getPointAt(t);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
  }
}
