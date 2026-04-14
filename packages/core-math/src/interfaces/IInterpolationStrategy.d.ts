import { HermiteSegment } from "../implementations/interpolation/hermiteInterpolation/HermiteSegment.js";
export interface IInterpolationStrategy<T, ParameterT> {
    interpolate(segment: HermiteSegment<T>, t: ParameterT): T;
}
//# sourceMappingURL=IInterpolationStrategy.d.ts.map