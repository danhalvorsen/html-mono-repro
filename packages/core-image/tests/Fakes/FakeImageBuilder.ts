import type { IImageMetadata } from "../../src/common/implementation/Image.Common.js";
import { PixelFormat } from "../../src/common/implementation/Image.Common.js";

import { SparsePixelStore } from "./SparsePixelStore.js";
import { IFakePixelStore } from "./IFakePixelStore.js";
import { ConstantPixelStore } from "./ConstantPixelStore.js";
import { FakeImage } from "./FakeImage.js";

export class FakeImageBuilder {
  private width = 2;
  private height = 2;
  private channels = 4;
  private format: PixelFormat = PixelFormat.RGBA8;

  private metadata?: IImageMetadata;
  private data?: Uint8Array | Float32Array;

  private defaultPixel: readonly number[] = [0, 0, 0, 255];
  private store: IFakePixelStore = new SparsePixelStore(this.defaultPixel);

  withSize(width: number, height: number): this {
    this.width = width;
    this.height = height;
    return this;
  }

  withFormat(format: PixelFormat, channels: number): this {
    this.format = format;
    this.channels = channels;
    return this;
  }

  withMetadata(metadata?: IImageMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withData(data: Uint8Array | Float32Array): this {
    this.data = data;
    return this;
  }

  withPixelStore(store: IFakePixelStore): this {
    this.store = store;
    return this;
  }

  withConstantPixel(pixel: readonly number[] = [0, 0, 0, 255]): this {
    this.defaultPixel = pixel;
    this.store = new ConstantPixelStore(pixel);
    return this;
  }

  withSparsePixels(fallback: readonly number[] = [0, 0, 0, 255]): this {
    this.defaultPixel = fallback;
    this.store = new SparsePixelStore(fallback);
    return this;
  }

  build(): FakeImage {
    const data = this.data ?? new Uint8Array(this.width * this.height * this.channels);

    return new FakeImage({
      width: this.width,
      height: this.height,
      channels: this.channels,
      format: this.format,
      metadata: this.metadata,
      data,
      store: this.store,
      defaultPixel: this.defaultPixel,
    });
  }
}