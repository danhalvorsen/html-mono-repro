import { Vector2 } from "./Vector2.js";
import { BoundingBox2D } from "./BoundingBox.js";

export class BoundingBox2DBuilder {
  private _minX = Infinity;
  private _minY = Infinity;
  private _maxX = -Infinity;
  private _maxY = -Infinity;
  private _hasAny = false;

  add(p: Vector2): this {
    this._hasAny = true;

    if (p.x < this._minX) this._minX = p.x;
    if (p.y < this._minY) this._minY = p.y;
    if (p.x > this._maxX) this._maxX = p.x;
    if (p.y > this._maxY) this._maxY = p.y;

    return this;
  }

  addMany(points: readonly Vector2[]): this {
    for (const p of points) this.add(p);
    return this;
  }

  build(): BoundingBox2D {
    if (!this._hasAny) {
      // safe neutral bbox (avoid throwing in rendering paths)
      return new BoundingBox2D(new Vector2(0, 0), new Vector2(0, 0));
    }

    return new BoundingBox2D(
      new Vector2(this._minX, this._minY),
      new Vector2(this._maxX, this._maxY)
    );
  }
}
