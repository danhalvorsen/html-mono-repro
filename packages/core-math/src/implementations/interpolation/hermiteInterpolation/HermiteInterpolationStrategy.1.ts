import { IInterpolationStrategy } from "../../../interfaces/IInterpolationStrategy.js"
import { HermiteSegment } from "./HermiteSegment.js"

export class HermiteInterpolationStrategy<T> implements IInterpolationStrategy<T, number> {
  constructor(private readonly interpolateFn: (segment: HermiteSegment<T>, t: number) => T) {}

  interpolate(segment: HermiteSegment<T>, t: number): T {
    return this.interpolateFn(segment, t);
  }
}
