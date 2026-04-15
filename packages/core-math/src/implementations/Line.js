export class Line {
    constructor(A, B) {
        this.A = A;
        this.B = B;
    }
    direction() {
        return this.B.subtract(this.A).normalize();
    }
    length() {
        return this.A.distanceTo(this.B);
    }
    getPoint(t) {
        return this.A.lerp(this.B, t);
    }
    closestPointTo(point) {
        const AB = this.B.subtract(this.A);
        const AP = point.subtract(this.A);
        const abLengthSquared = AB.dot(AB);
        if (abLengthSquared === 0)
            return this.A.clone(); // Line is a point
        const t = AP.dot(AB) / abLengthSquared;
        const clampedT = Math.max(0, Math.min(1, t));
        return this.getPoint(clampedT);
    }
}
//# sourceMappingURL=Line.js.map