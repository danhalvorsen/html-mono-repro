import { IBoundingBox } from '../interfaces/IBoundingBox.js';
import { Vector2 } from './Vector2.js';

export class BoundingBox2D implements IBoundingBox {
  constructor(
    public min: Vector2,
    public max: Vector2
  ) {}

  static fromPoints(p1: Vector2, p2: Vector2): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y)),
      new Vector2(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y))
    );
  }

  get minX(): number {
    return this.min.x;
  }

  get minY(): number {
    return this.min.y;
  }

  get maxX(): number {
    return this.max.x;
  }

  get maxY(): number {
    return this.max.y;
  }

  width(): number {
    return this.max.x - this.min.x;
  }

  height(): number {
    return this.max.y - this.min.y;
  }

  center(): Vector2 {
    return new Vector2(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2
    );
  }

  contains(p: Vector2): boolean {
    return (
      p.x >= this.min.x &&
      p.x <= this.max.x &&
      p.y >= this.min.y &&
      p.y <= this.max.y
    );
  }

  intersects(other: IBoundingBox): boolean {
    return !(
      this.max.x < other.min.x ||
      this.min.x > other.max.x ||
      this.max.y < other.min.y ||
      this.min.y > other.max.y
    );
  }
}
