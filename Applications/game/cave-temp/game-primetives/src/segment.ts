import { Vector2 } from '@monorepo/core-math';

export class Segment {
  public readonly start: Vector2;
  public readonly end: Vector2;

  public constructor(start: Vector2, end: Vector2) {
    if (start.equals(end)) {
      throw new RangeError('Segment endpoints must be distinct.');
    }

    this.start = start.clone();
    this.end = end.clone();
  }

  public withStart(start: Vector2): Segment {
    return new Segment(start, this.end);
  }

  public withEnd(end: Vector2): Segment {
    return new Segment(this.start, end);
  }

  public get length(): number {
    return this.end.clone().subtract(this.start).length();
  }

  public get midpoint(): Vector2 {
    return new Vector2(
      (this.start.x + this.end.x) / 2,
      (this.start.y + this.end.y) / 2,
    );
  }
}
