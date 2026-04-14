import { IInterpolationStrategy } from "../../../interfaces/IInterpolationStrategy.js";
import { HermiteSegment } from "./HermiteSegment.js";
export declare class HermiteInterpolationStrategy<T> implements IInterpolationStrategy<T, number> {
    private readonly interpolateFn;
    constructor(interpolateFn: (segment: HermiteSegment<T>, t: number) => T);
    interpolate(segment: HermiteSegment<T>, t: number): T;
}
//# sourceMappingURL=HermiteInterpolationStrategy.1.d.ts.map