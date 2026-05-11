import { Vector2 } from '@monorepo/core-math';

export class Square {
  public readonly topLeft: Vector2;
  public readonly size: number;

  public constructor(topLeft: Vector2, size: number) {
    if (size <= 0) {
      throw new RangeError('Square size must be positive.');
    }

    this.topLeft = topLeft.clone();
    this.size = size;
  }

  public withTopLeft(topLeft: Vector2): Square {
    return new Square(topLeft, this.size);
  }

  public withSize(size: number): Square {
    return new Square(this.topLeft, size);
  }

  public contains(point: Vector2): boolean {
    return (
      point.x >= this.topLeft.x &&
      point.x <= this.topLeft.x + this.size &&
      point.y >= this.topLeft.y &&
      point.y <= this.topLeft.y + this.size
    );
  }
}
