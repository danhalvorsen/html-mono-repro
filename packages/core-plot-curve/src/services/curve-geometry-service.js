import { Vector2 } from "@monorepo/core-math";
export class CurveGeometryService {
    pointAt(points, t) {
        if (points.length === 0) {
            return null;
        }
        if (points.length === 1) {
            return points[0] ?? null;
        }
        const clampedT = Math.max(0, Math.min(1, t));
        const scaled = clampedT * (points.length - 1);
        const index = Math.floor(scaled);
        const localT = scaled - index;
        const start = points[index];
        const end = points[Math.min(index + 1, points.length - 1)];
        if (start === undefined || end === undefined) {
            return null;
        }
        return start.lerp(end, localT);
    }
    tangentAt(points, t) {
        if (points.length < 2) {
            return null;
        }
        const epsilon = 1 / Math.max(8, points.length - 1);
        const before = this.pointAt(points, Math.max(0, t - epsilon));
        const after = this.pointAt(points, Math.min(1, t + epsilon));
        if (before === null || after === null) {
            return null;
        }
        return after.subtract(before).normalize();
    }
    normalAt(points, t) {
        const tangent = this.tangentAt(points, t);
        if (tangent === null) {
            return null;
        }
        return new Vector2(-tangent.y, tangent.x).normalize();
    }
    length(points) {
        let total = 0;
        for (let index = 1; index < points.length; index += 1) {
            const start = points[index - 1];
            const end = points[index];
            if (start !== undefined && end !== undefined) {
                total += start.distanceTo(end);
            }
        }
        return total;
    }
}
//# sourceMappingURL=curve-geometry-service.js.map