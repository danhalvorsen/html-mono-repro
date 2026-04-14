import { Vector2 } from "../../implementations/Vector2.js";
import { AABB2 } from "./AABB2.js";
export class OBB2 {
    constructor(center, axisX, axisY, extents) {
        this.center = center;
        this.axisX = axisX.clone().normalize();
        this.axisY = axisY.clone().normalize();
        this.extents = extents;
    }
    toAABB() {
        const ex = Math.abs(this.axisX.x) * this.extents.x +
            Math.abs(this.axisY.x) * this.extents.y;
        const ey = Math.abs(this.axisX.y) * this.extents.x +
            Math.abs(this.axisY.y) * this.extents.y;
        return new AABB2(new Vector2(this.center.x - ex, this.center.y - ey), new Vector2(this.center.x + ex, this.center.y + ey));
    }
    projectOnto(axis) {
        const c = this.center.dot(axis);
        const r = Math.abs(this.axisX.dot(axis)) * this.extents.x +
            Math.abs(this.axisY.dot(axis)) * this.extents.y;
        return { min: c - r, max: c + r };
    }
    corners() {
        const x = this.axisX.clone().scale(this.extents.x);
        const y = this.axisY.clone().scale(this.extents.y);
        return [
            this.center.clone().subtract(x).subtract(y),
            this.center.clone().add(x).subtract(y),
            this.center.clone().add(x).add(y),
            this.center.clone().subtract(x).add(y)
        ];
    }
}
//# sourceMappingURL=OBB2.js.map