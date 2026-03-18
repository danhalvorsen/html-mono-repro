// src/primitives/BoundingBox2Gpu.ts

import { IBoundingBoxGpu } from "../contracts/IBoundingBoxGpu.js";
import { Vector2Gpu } from "./Vector2Gpu.js";

export class BoundingBox2Gpu implements IBoundingBoxGpu {
  public constructor(
    public readonly min: Vector2Gpu,
    public readonly max: Vector2Gpu,
  ) {}

  public static fromPoints(a: Vector2Gpu, b: Vector2Gpu): BoundingBox2Gpu {
    return new BoundingBox2Gpu(
      new Vector2Gpu(Math.min(a.x, b.x), Math.min(a.y, b.y)),
      new Vector2Gpu(Math.max(a.x, b.x), Math.max(a.y, b.y)),
    );
  }

  public get minX(): number {
    return this.min.x;
  }

  public get minY(): number {
    return this.min.y;
  }

  public get maxX(): number {
    return this.max.x;
  }

  public get maxY(): number {
    return this.max.y;
  }

  public width(): number {
    return this.max.x - this.min.x;
  }

  public height(): number {
    return this.max.y - this.min.y;
  }

  public center(): Vector2Gpu {
    return new Vector2Gpu(
      (this.min.x + this.max.x) * 0.5,
      (this.min.y + this.max.y) * 0.5,
    );
  }

  public contains(p: Vector2Gpu): boolean {
    return (
      p.x >= this.min.x &&
      p.x <= this.max.x &&
      p.y >= this.min.y &&
      p.y <= this.max.y
    );
  }

  public intersects(other: IBoundingBoxGpu): boolean {
    return !(
      this.max.x < other.min.x ||
      this.min.x > other.max.x ||
      this.max.y < other.min.y ||
      this.min.y > other.max.y
    );
  }
}