import type { HeightAxis } from "./HeightAxis.js";
import type { IGridPointUvMapper } from "./IGridPointUvMapper.js";

export type ImageHeightmapProjectorOptions = Readonly<{
  readonly amplitude?: number;
  readonly baseHeight?: number;
  readonly heightAxis?: HeightAxis;
  readonly uvMapper?: IGridPointUvMapper;
}>;