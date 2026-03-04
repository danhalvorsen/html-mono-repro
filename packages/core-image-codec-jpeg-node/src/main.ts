// packages/core-image-codec-jpeg-node/src/code.ts
// ============================================================================
// core-image-codec-jpeg-node
// - Node-only JPEG codec implementation using `jpeg-js`.
// - Implements core-image-codec abstractions (IImageDecoder/IImageEncoder).
// - No registry here; you register the returned decoder/encoder into your registry.
// ============================================================================
 
import { PixelFormat, type IImage, type IImageBuffer, type IImageMetadata } from "@monorepo/core-image";

import type {
  IImageDecoder,
  IImageEncoder,
  CodecId,
  Mime,
  FileExtension,
  ImageEncodeOptions,
} from "@monorepo/core-image-codec";

import jpeg from "jpeg-js";

// ============================================================================
// Public factory
// ============================================================================

export type JpegNodeCodec = Readonly<{
  decoder: IImageDecoder;
  encoder: IImageEncoder;
}>;

export function createJpegNodeCodec(cfg?: Readonly<{ id?: CodecId }>): JpegNodeCodec {
  const id = (cfg?.id ?? "jpeg-node") as CodecId;
  return {
    decoder: new JpegNodeDecoder(id),
    encoder: new JpegNodeEncoder(id),
  };
}

// ============================================================================
// Concrete Decoder / Encoder
// ============================================================================

const JPEG_MIME: Mime = "image/jpeg";
const JPEG_EXTS: readonly FileExtension[] = ["jpg", "jpeg"];

class JpegNodeDecoder implements IImageDecoder {
  public readonly id: CodecId;
  public readonly mimeTypes: readonly Mime[] = [JPEG_MIME];
  public readonly extensions: readonly FileExtension[] = JPEG_EXTS;

  constructor(id: CodecId) {
    this.id = id;
  }

  async decode(data: Uint8Array): Promise<IImage> {
    // jpeg-js returns RGBA (4 channels) in a Uint8Array
    const decoded = jpeg.decode(data, { useTArray: true });
    if (!decoded || !decoded.data || decoded.width <= 0 || decoded.height <= 0) {
      throw new Error("jpeg-node: Failed to decode JPEG.");
    }

    const buffer: IImageBuffer = {
      width: decoded.width,
      height: decoded.height,
      channels: 4,
      data: decoded.data as Uint8Array,
    };

    return new BufferBackedImage(buffer, PixelFormat.RGBA8, /*metadata*/ undefined);
  }
}

class JpegNodeEncoder implements IImageEncoder {
  public readonly id: CodecId;
  public readonly mimeTypes: readonly Mime[] = [JPEG_MIME];
  public readonly extensions: readonly FileExtension[] = JPEG_EXTS;

  constructor(id: CodecId) {
    this.id = id;
  }

  async encode(image: IImage, options?: ImageEncodeOptions): Promise<Uint8Array> {
    const raw = toRgba8(image);

    const quality = normalizeQuality(options?.quality);
    const encoded = jpeg.encode(
      { data: raw.data, width: raw.width, height: raw.height },
      quality
    );

    // jpeg-js returns Buffer in `data` (Uint8Array-compatible)
    return encoded.data as Uint8Array;
  }
}

// ============================================================================
// Internal: Buffer-backed Image (no dependency on a concrete core-image class)
// ============================================================================

class BufferBackedImage implements IImage {
  public readonly width: number;
  public readonly height: number;
  public readonly format: PixelFormat;
  public readonly buffer: IImageBuffer;
  public readonly metadata?: IImageMetadata;

  constructor(buffer: IImageBuffer, format: PixelFormat, metadata?: IImageMetadata) {
    this.width = buffer.width;
    this.height = buffer.height;
    this.format = format;
    this.buffer = buffer;
    this.metadata = metadata;
  }

  getPixel(x: number, y: number): readonly number[] {
    const b = this.buffer;
    const i = (y * b.width + x) * b.channels;
    if (i < 0 || i + b.channels > b.data.length) return [0, 0, 0, 0];
    // always return a copy (immutability-friendly)
    return Array.from(b.data.slice(i, i + b.channels));
  }

  setPixel(x: number, y: number, value: readonly number[]): void {
    const b = this.buffer;
    const i = (y * b.width + x) * b.channels;
    if (i < 0 || i + b.channels > b.data.length) return;

    for (let c = 0; c < b.channels; c++) {
      b.data[i + c] = (value[c] ?? 0) as number;
    }
  }
}

// ============================================================================
// Internal: helpers
// ============================================================================

function normalizeQuality(q?: number): number {
  // jpeg-js expects 0..100 (integer)
  if (q === undefined || q === null || Number.isNaN(q)) return 90;
  if (q < 0) return 0;
  if (q > 100) return 100;
  return Math.round(q);
}

function toRgba8(image: IImage): { width: number; height: number; data: Uint8Array } {
  const b = image.buffer;

  // Fast path: already RGBA8
  if (b.channels === 4 && b.data instanceof Uint8Array) {
    return { width: b.width, height: b.height, data: b.data };
  }

  // Convert common cases to RGBA8
  const out = new Uint8Array(b.width * b.height * 4);

  // If Float32Array, assume 0..1 (common), clamp and scale.
  const isFloat = b.data instanceof Float32Array;

  const read = (idx: number): number => {
    const v = (b.data as any)[idx] as number;
    if (!isFloat) return v | 0;
    const x = Math.max(0, Math.min(1, v));
    return Math.round(x * 255);
  };

  const pxCount = b.width * b.height;

  if (b.channels === 3) {
    for (let p = 0; p < pxCount; p++) {
      const si = p * 3;
      const di = p * 4;
      out[di + 0] = read(si + 0);
      out[di + 1] = read(si + 1);
      out[di + 2] = read(si + 2);
      out[di + 3] = 255;
    }
    return { width: b.width, height: b.height, data: out };
  }

  if (b.channels === 1) {
    for (let p = 0; p < pxCount; p++) {
      const si = p;
      const di = p * 4;
      const g = read(si);
      out[di + 0] = g;
      out[di + 1] = g;
      out[di + 2] = g;
      out[di + 3] = 255;
    }
    return { width: b.width, height: b.height, data: out };
  }

  if (b.channels === 4) {
    for (let p = 0; p < pxCount; p++) {
      const si = p * 4;
      const di = si;
      out[di + 0] = read(si + 0);
      out[di + 1] = read(si + 1);
      out[di + 2] = read(si + 2);
      out[di + 3] = read(si + 3);
    }
    return { width: b.width, height: b.height, data: out };
  }

  throw new Error(`jpeg-node: Unsupported channel count '${b.channels}'.`);
}

// ============================================================================
// Exports (explicit)
// ============================================================================

export type { IImageDecoder, IImageEncoder };