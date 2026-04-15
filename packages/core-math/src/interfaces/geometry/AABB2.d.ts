import { Vector2 } from "../../implementations/Vector2.js";
import { IBoundingBox } from "../IBoundingBox.js";
export declare class AABB2 implements IBoundingBox {
    readonly min: Vector2;
    readonly max: Vector2;
    constructor(min: Vector2, max: Vector2);
    containsBox(other: IBoundingBox): boolean;
    width(): number;
    height(): number;
    center(): Vector2;
    contains(p: Vector2): boolean;
    intersects(other: IBoundingBox): boolean;
}
//# sourceMappingURL=AABB2.d.ts.map