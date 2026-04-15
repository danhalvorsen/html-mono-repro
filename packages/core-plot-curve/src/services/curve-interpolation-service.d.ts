import { Vector2 } from "@monorepo/core-math";
import { InterpolatedCurve } from "../domain/interpolated-curve.js";
export declare class CurveInterpolationService {
    sample(curve: InterpolatedCurve): readonly Vector2[];
    private sampleCatmullRom;
}
//# sourceMappingURL=curve-interpolation-service.d.ts.map