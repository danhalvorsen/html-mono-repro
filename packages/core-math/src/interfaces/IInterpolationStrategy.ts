import { HermiteSegment } from "../implementations/interpolation/hermiteInterpolation/HermiteSegment.js";
import { ParameterT } from "../implementations/Transform.js";

export interface IInterpolationStrategy<T, ParameterT> {
    interpolate(segment: HermiteSegment<T>, t: ParameterT): T;
}
