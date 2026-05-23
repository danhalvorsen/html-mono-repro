import type { RgbaColor } from "./RgbaColor.js";

export interface IRgbaToHeightConverter {
  convert(color: RgbaColor): number;
}