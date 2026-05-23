import type { RgbaImageData } from "./RgbaImageData.js";

export interface IImageDataLoader {
  load(source: string): Promise<RgbaImageData>;
}