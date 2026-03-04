// packages/core-image/tests/fixtures/ImageGpsFixture.ts

import type { IImage, IImageBuffer, IImageMetadata } from "../../src/common/implementation/Image.Common.js";
import { PixelFormat } from "../../src/common/implementation/Image.Common.js";

class FakeImage implements IImage {
  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly format: PixelFormat,
    public readonly buffer: IImageBuffer,
    public readonly metadata?: IImageMetadata
  ) {}

  getPixel(_x: number, _y: number): readonly number[] { return [0, 0, 0, 0]; }
  setPixel(_x: number, _y: number, _value: readonly number[]): void {}
}

export class ImageGpsFixture {

  static stavanger(): { lat: number; lon: number; alt?: number } {
    return { lat: 58.969975, lon: 5.733107, alt: 9 };
  }

  createImageWithGps(gps: { lat: number; lon: number; alt?: number }): IImage {
    const width = 2, height = 2, channels = 4;

    const buffer: IImageBuffer = {
      width,
      height,
      channels,
      data: new Uint8Array(width * height * channels),
    };

    return new FakeImage(
      width,
      height,
      PixelFormat.RGBA8,
      buffer,
      { gps }
    );
  }

  createImageWithoutMetadata(): IImage {
    const width = 1, height = 1, channels = 4;

    const buffer: IImageBuffer = {
      width,
      height,
      channels,
      data: new Uint8Array(width * height * channels),
    };

    return new FakeImage(width, height, PixelFormat.RGBA8, buffer, undefined);
  }

  createImageWithMetadataNoGps(): IImage {
    const width = 1, height = 1, channels = 4;

    const buffer: IImageBuffer = {
      width,
      height,
      channels,
      data: new Uint8Array(width * height * channels),
    };

    return new FakeImage(width, height, PixelFormat.RGBA8, buffer, { exif: { Make: "Test" } });
  }
}