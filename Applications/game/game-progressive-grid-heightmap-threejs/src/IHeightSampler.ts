import type { UvCoordinate } from "./UvCoordinate.js";

export interface IHeightSampler {
  sample(uv: UvCoordinate): number;
}