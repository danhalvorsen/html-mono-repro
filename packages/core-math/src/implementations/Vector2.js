export class Vector2 {
    constructor(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    scale(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    cross(v) {
        // In 2D, the "cross product" returns a pseudo-vector on Z only (scalar form)
        const z = this.x * v.y - this.y * v.x;
        return new Vector2(0, 0, z);
    }
    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    normalize() {
        const len = this.length();
        return len === 0 ? this.clone() : this.scale(1 / len);
    }
    transform(matrix) {
        const m = matrix;
        const x = this.x, y = this.y;
        return new Vector2(x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]);
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    angleTo(v) {
        const dot = this.dot(v);
        const lengths = this.length() * v.length();
        return lengths === 0 ? 0 : Math.acos(dot / lengths);
    }
    projectOnto(v) {
        const scalar = this.dot(v) / v.dot(v);
        return v.scale(scalar);
    }
    reflect(normal) {
        const dot2 = 2 * this.dot(normal);
        return this.subtract(normal.scale(dot2));
    }
    lerp(v, t) {
        return new Vector2(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t);
    }
    distanceTo(v) {
        return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
    }
    equals(v, tolerance = 1e-6) {
        return (Math.abs(this.x - v.x) < tolerance && Math.abs(this.y - v.y) < tolerance);
    }
    toArray() {
        return [this.x, this.y];
    }
    multiplyScalar(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
}
//# sourceMappingURL=Vector2.js.map