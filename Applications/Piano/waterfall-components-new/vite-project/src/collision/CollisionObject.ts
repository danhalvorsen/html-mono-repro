import { Vector2 } from "@monorepo/core-math";

export class CollisionObject {
  public position: Vector2;
  public readonly size: Vector2;

  public constructor(position: Vector2, size: Vector2) {
    this.position = position;
    this.size = size;
  }

  public get left(): number {
    return this.position.x;
  }

  public get right(): number {
    return this.position.x + this.size.x;
  }

  public get top(): number {
    return this.position.y;
  }

  public get bottom(): number {
    return this.position.y + this.size.y;
  }
}
