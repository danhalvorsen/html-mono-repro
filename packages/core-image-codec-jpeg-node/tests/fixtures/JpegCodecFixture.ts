import { ImageCodecRegistry, ImageCodecResolver } from "@monorepo/core-image-codec";

import { IImage, IImageBuffer, PixelFormat } from "@monorepo/core-image";
import { createJpegNodeCodec } from "core-image-codec-jpeg-node/src/main.js";

/**
 * DRY fixture. IMPORTANT: codec() must RETURN an object.
 * Your current one returns void (likely because it's still throwing or not returning).
 */
export class JpegCodecFixture {
  /**
   * Wire your exports HERE and ensure you return { decoder, encoder }.
   * If you already have node code, replace the two imports below with your real ones.
   */
  codec(): { decoder: any; encoder: any } {
    return createJpegNodeCodec();
  }

  createRegistryWithCodec() {
    const { decoder, encoder } = this.codec();
    const registry = new ImageCodecRegistry();
    registry.registerDecoder(decoder);
    registry.registerEncoder(encoder);
    return { registry, resolver: new ImageCodecResolver(registry), decoder, encoder };
  }

  create2x2RgbaImage(): IImage {
    const width = 2;
    const height = 2;
    const channels = 4;

    const data = new Uint8Array([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
      255, 255, 255, 255,
    ]);

    const buffer: IImageBuffer = { width, height, channels, data };
    return new TestImage(width, height, PixelFormat.RGBA8, buffer);
  }

  assertPixelClose(actual: readonly number[], expected: readonly number[], tol = 25) {
    for (let i = 0; i < 3; i++) {
      const a = actual[i] ?? 0;
      const e = expected[i] ?? 0;
      const d = Math.abs(a - e);
      if (d > tol) throw new Error(`Pixel mismatch ch${i}: expected ~${e} got ${a} (Δ=${d}, tol=${tol})`);
    }
  }
}

class TestImage implements IImage {
  public readonly metadata = undefined;

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly format: PixelFormat,
    public readonly buffer: IImageBuffer
  ) {}

  getPixel(x: number, y: number): readonly number[] {
    const idx = (y * this.width + x) * this.buffer.channels;
    const d = this.buffer.data;
    return [d[idx] ?? 0, d[idx + 1] ?? 0, d[idx + 2] ?? 0, d[idx + 3] ?? 255];
  }

  setPixel(x: number, y: number, value: readonly number[]): void {
    const idx = (y * this.width + x) * this.buffer.channels;
    const d = this.buffer.data;
    d[idx] = clampByte(value[0] ?? 0);
    d[idx + 1] = clampByte(value[1] ?? 0);
    d[idx + 2] = clampByte(value[2] ?? 0);
    if (this.buffer.channels >= 4) d[idx + 3] = clampByte(value[3] ?? 255);
  }
}

function clampByte(n: number): number {
  if (n <= 0) return 0;
  if (n >= 255) return 255;
  return n | 0;
}