import { HermiteSegment } from "./HermiteSegment.js";
import { Vector3 } from "../../Vector3.js";

export const vector3HermiteFn = (seg: HermiteSegment<Vector3>, t: number): Vector3 => {
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return seg.p0.multiplyScalar(h00)
        .add(seg.m0.multiplyScalar(h10))
        .add(seg.p1.multiplyScalar(h01))
        .add(seg.m1.multiplyScalar(h11));
};
