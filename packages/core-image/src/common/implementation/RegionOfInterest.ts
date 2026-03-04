// packages/core-image/src/implementations/RegionOfInterest.ts

import type { IRectangle } from "../interfaces/IRectangle.js";
import type { IRegionOfInterest } from "../interfaces/IRegionOfInterest.js";
import { Rectangle } from "./Rectangle.js";

export class RegionOfInterest extends Rectangle implements IRegionOfInterest {

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    public readonly name?: string
  ) {
    super(x, y, width, height);
  }

  clamp(bounds: IRectangle): RegionOfInterest {
    const l = Math.max(this.left, bounds.left);
    const t = Math.max(this.top, bounds.top);
    const r = Math.min(this.right, bounds.right);
    const b = Math.min(this.bottom, bounds.bottom);

    if (r <= l || b <= t) return new RegionOfInterest(0, 0, 0, 0, this.name);

    return new RegionOfInterest(l, t, r - l, b - t, this.name);
  }
}