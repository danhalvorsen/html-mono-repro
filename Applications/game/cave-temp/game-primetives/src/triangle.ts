import { Vector2 } from "@monorepo/core-math";

export class Triangle {
  public readonly a: Vector2;
  public readonly b: Vector2;
  public readonly c: Vector2;

  public constructor(a: Vector2, b: Vector2, c: Vector2) {
    // Degenerate triangle check (all points must be distinct)
    if (a.equals(b) || b.equals(c) || c.equals(a)) {
      throw new RangeError("Triangle vertices must be distinct.");
    }

    this.a = a.clone();
    this.b = b.clone();
    this.c = c.clone();
  }

  public withA(a: Vector2): Triangle {
    return new Triangle(a, this.b, this.c);
  }

  public withB(b: Vector2): Triangle {
    return new Triangle(this.a, b, this.c);
  }

  public withC(c: Vector2): Triangle {
    return new Triangle(this.a, this.b, c);
  }

  public contains(point: Vector2): boolean {
    // Barycentric technique
    const v0 = this.c.clone().subtract(this.a);
    const v1 = this.b.clone().subtract(this.a);
    const v2 = point.clone().subtract(this.a);

    const dot00 = v0.dot(v0);
    const dot01 = v0.dot(v1);
    const dot02 = v0.dot(v2);
    const dot11 = v1.dot(v1);
    const dot12 = v1.dot(v2);

    const denom = dot00 * dot11 - dot01 * dot01;
    if (denom === 0) return false; // Degenerate

    const u = (dot11 * dot02 - dot01 * dot12) / denom;
    const v = (dot00 * dot12 - dot01 * dot02) / denom;

    return u >= 0 && v >= 0 && u + v <= 1;
  }
}
