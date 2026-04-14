import { Vector2 } from './Vector2.js';
export class BoundingBox2D {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    static fromPoints(p1, p2) {
        return new BoundingBox2D(new Vector2(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y)), new Vector2(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y)));
    }
    get minX() {
        return this.min.x;
    }
    get minY() {
        return this.min.y;
    }
    get maxX() {
        return this.max.x;
    }
    get maxY() {
        return this.max.y;
    }
    width() {
        return this.max.x - this.min.x;
    }
    height() {
        return this.max.y - this.min.y;
    }
    center() {
        return new Vector2((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2);
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
    containsBox(other) {
        return (other.min.x >= this.min.x &&
            other.min.y >= this.min.y &&
            other.max.x <= this.max.x &&
            other.max.y <= this.max.y);
    }
}
//# sourceMappingURL=BoundingBox.js.map