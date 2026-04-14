import { Vector2 } from "@monorepo/core-math";
export declare class CurveGeometryService {
    pointAt(points: readonly Vector2[], t: number): Vector2 | null;
    tangentAt(points: readonly Vector2[], t: number): Vector2 | null;
    normalAt(points: readonly Vector2[], t: number): Vector2 | null;
    length(points: readonly Vector2[]): number;
}
//# sourceMappingURL=curve-geometry-service.d.ts.map