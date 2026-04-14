import { IBoundingBox } from '../interfaces/IBoundingBox.js';
import { Vector2 } from './Vector2.js';
export declare class BoundingBox2D implements IBoundingBox {
    min: Vector2;
    max: Vector2;
    constructor(min: Vector2, max: Vector2);
    static fromPoints(p1: Vector2, p2: Vector2): BoundingBox2D;
    get minX(): number;
    get minY(): number;
    get maxX(): number;
    get maxY(): number;
    width(): number;
    height(): number;
    center(): Vector2;
    contains(p: Vector2): boolean;
    intersects(other: IBoundingBox): boolean;
    containsBox(other: IBoundingBox): boolean;
}
//# sourceMappingURL=BoundingBox.d.ts.map