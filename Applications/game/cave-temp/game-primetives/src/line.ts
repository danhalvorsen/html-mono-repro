import { Vector2 } from '@monorepo/core-math';

export class Line {
  public readonly start: Vector2;
  public readonly end: Vector2;

  public constructor(start: Vector2, end: Vector2) {
    if (start.equals(end)) {
      throw new RangeError('Line endpoints must be distinct.');
    }

    this.start = start.clone();
    this.end = end.clone();
  }

  public withStart(start: Vector2): Line {
    return new Line(start, this.end);
  }

  public withEnd(end: Vector2): Line {
    return new Line(this.start, end);
  }

  public get length(): number {
    return this.end.clone().subtract(this.start).length();
  }
}
