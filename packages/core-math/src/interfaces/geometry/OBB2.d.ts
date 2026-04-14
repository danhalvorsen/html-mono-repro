import { Vector2 } from "../../implementations/Vector2.js";
import { AABB2 } from "./AABB2.js";
export declare class OBB2 {
    readonly center: Vector2;
    readonly axisX: Vector2;
    readonly axisY: Vector2;
    readonly extents: Vector2;
    constructor(center: Vector2, axisX: Vector2, axisY: Vector2, extents: Vector2);
    toAABB(): AABB2;
    projectOnto(axis: Vector2): {
        min: number;
        max: number;
    };
    corners(): Vector2[];
}
//# sourceMappingURL=OBB2.d.ts.map