import { PixelFormat, IImageBuffer, IImageMetadata } from "./Image.Common.js";

// ================================================================
// Image Model (core leaf contract)
// ================================================================

export interface IImage {
  readonly width: number;
  readonly height: number;
  readonly format: PixelFormat;
  readonly buffer: IImageBuffer;
  readonly metadata?: IImageMetadata;

  getPixel(x: number, y: number): readonly number[];
  setPixel(x: number, y: number, value: readonly number[]): void;
}
