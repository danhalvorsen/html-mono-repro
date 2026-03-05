// image.common.ts
// Shared primitives + leaf contracts for core-image.

import type { Point2, Point3, IBoundingBox, IMatrix, ITransform, IVector, Vector2, Vector3} from "@monorepo/core-math";
import { IImage } from "./IImage.js";
 
export type { Point2, Point3, IBoundingBox, IMatrix, ITransform, IVector };
export { Vector2, Vector3 };

export type PixelCoord = Point2;

// ================================================================
// Pixel formats
// ================================================================

export enum PixelFormat {
  RGB8 = "RGB8",
  RGBA8 = "RGBA8",
  GRAY8 = "GRAY8",
  RGB32F = "RGB32F",
  RGBA32F = "RGBA32F"
}

// ================================================================
// Image Buffer
// ================================================================

export type PixelData = Uint8Array | Float32Array;

export interface IImageBuffer {
  readonly width: number;
  readonly height: number;
  readonly channels: number;
  readonly data: PixelData;
}

// ================================================================
// Metadata
// ================================================================

export interface IGpsMetadata {
  readonly lat: number;
  readonly lon: number;
  readonly alt?: number;
}
 
export interface IImageMetadata {
  readonly exif?: Readonly<Record<string, unknown>>;
  readonly gps?: IGpsMetadata;
}

export interface IImageEncoder {
  readonly format: string;
  encode(image: IImage): Promise<ArrayBuffer>;
}

