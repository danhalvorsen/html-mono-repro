import { Vector2 } from "./Vector2.js";
import { BoundingBox2D } from "./BoundingBox.js";
export class BoundingBox2DBuilder {
    constructor() {
        this._minX = Infinity;
        this._minY = Infinity;
        this._maxX = -Infinity;
        this._maxY = -Infinity;
        this._hasAny = false;
    }
    add(p) {
        this._hasAny = true;
        if (p.x < this._minX)
            this._minX = p.x;
        if (p.y < this._minY)
            this._minY = p.y;
        if (p.x > this._maxX)
            this._maxX = p.x;
        if (p.y > this._maxY)
            this._maxY = p.y;
        return this;
    }
    addMany(points) {
        for (const p of points)
            this.add(p);
        return this;
    }
    build() {
        if (!this._hasAny) {
            // safe neutral bbox (avoid throwing in rendering paths)
            return new BoundingBox2D(new Vector2(0, 0), new Vector2(0, 0));
        }
        return new BoundingBox2D(new Vector2(this._minX, this._minY), new Vector2(this._maxX, this._maxY));
    }
}
//# sourceMappingURL=BoundingBox2DBuilder.js.map