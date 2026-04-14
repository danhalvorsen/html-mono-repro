import { Vector2 } from "./Vector2.js";
import { BoundingBox2D } from "./BoundingBox.js";
export declare class BoundingBox2DBuilder {
    private _minX;
    private _minY;
    private _maxX;
    private _maxY;
    private _hasAny;
    add(p: Vector2): this;
    addMany(points: readonly Vector2[]): this;
    build(): BoundingBox2D;
}
//# sourceMappingURL=BoundingBox2DBuilder.d.ts.map