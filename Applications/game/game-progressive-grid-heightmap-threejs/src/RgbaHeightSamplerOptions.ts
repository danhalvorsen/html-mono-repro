import type { IRgbaToHeightConverter } from "./IRgbaToHeightConverter.js";

export type RgbaHeightSamplerOptions = Readonly<{
  readonly converter?: IRgbaToHeightConverter;
  readonly flipY?: boolean;
}>;