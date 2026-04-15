import { Vector2 } from "../../implementations/Vector2.js";
export class AABB2 {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    containsBox(other) {
        return (other.min.x >= this.min.x &&
            other.max.x <= this.max.x &&
            other.min.y >= this.min.y &&
            other.max.y <= this.max.y);
    }
    width() {
        return this.max.x - this.min.x;
    }
    height() {
        return this.max.y - this.min.y;
    }
    center() {
        return new Vector2((this.min.x + this.max.x) * 0.5, (this.min.y + this.max.y) * 0.5);
    }
    contains(p) {
        return (p.x >= this.min.x &&
            p.x <= this.max.x &&
            p.y >= this.min.y &&
            p.y <= this.max.y);
    }
    intersects(other) {
        return !(this.max.x < other.min.x ||
            this.min.x > other.max.x ||
            this.max.y < other.min.y ||
            this.min.y > other.max.y);
    }
}
//# sourceMappingURL=AABB2.js.map