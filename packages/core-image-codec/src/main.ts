// packages/core-image-codec/src/code.ts
// NOTE: You said you now have split files. This is the *exact* consolidated
// single-file version that replaces them (paste over code.ts and export from index).

import type { IImage } from "@monorepo/core-image";

// ============================================================================
// Types
// ============================================================================

export type CodecId = string;
export type FileExtension = string; // normalized: "jpg" (no dot), lower-case
export type Mime = string;          // normalized: "image/jpeg", lower-case

export type ImageEncodeOptions = Readonly<{
  quality?: number; // 0..100 (convention)
  mimeType?: Mime;
}>;

// ============================================================================
// Normalizers (pure)
// ============================================================================

export function normalizeExtension(ext: FileExtension | string): FileExtension {
  const v = String(ext ?? "").trim().toLowerCase();
  return (v.startsWith(".") ? v.slice(1) : v) as FileExtension;
}

export function normalizeMime(mime: Mime | string | unknown): Mime {
  return String(mime ?? "").trim().toLowerCase();
}

// ============================================================================
// Errors
// ============================================================================

export class CodecError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }
}

export class CodecNotFoundError extends CodecError {
  constructor(message: string) { super(message); }
}

export class CodecRegistrationError extends CodecError {
  constructor(message: string) { super(message); }
}

// ============================================================================
// Interfaces
// ============================================================================

export interface IImageDecoder {
  readonly id: CodecId;
  readonly mimeTypes: readonly Mime[];
  readonly extensions: readonly FileExtension[];
  decode(data: Uint8Array): Promise<IImage>;
}

export interface IImageEncoder {
  readonly id: CodecId;
  readonly mimeTypes: readonly Mime[];
  readonly extensions: readonly FileExtension[];
  encode(image: IImage, options?: ImageEncodeOptions): Promise<Uint8Array>;
}

export interface IImageCodecRegistry {
  registerDecoder(decoder: IImageDecoder): void;
  registerEncoder(encoder: IImageEncoder): void;

  tryGetDecoderByExtension(ext: FileExtension): IImageDecoder | undefined;
  tryGetDecoderByMimeType(mimeType: Mime): IImageDecoder | undefined;

  tryGetEncoderByExtension(ext: FileExtension): IImageEncoder | undefined;
  tryGetEncoderByMimeType(mimeType: Mime): IImageEncoder | undefined;

  listDecoders(): readonly IImageDecoder[];
  listEncoders(): readonly IImageEncoder[];
}

// ============================================================================
// Registry
// ============================================================================

type CodecMeta = Readonly<{
  id: CodecId;
  mimeTypes: readonly string[];
  extensions: readonly string[];
}>;

export class ImageCodecRegistry implements IImageCodecRegistry {
  private readonly decoders: IImageDecoder[] = [];
  private readonly encoders: IImageEncoder[] = [];

  private readonly decoderByExt = new Map<string, IImageDecoder>();
  private readonly decoderByMime = new Map<string, IImageDecoder>();

  private readonly encoderByExt = new Map<string, IImageEncoder>();
  private readonly encoderByMime = new Map<string, IImageEncoder>();

  registerDecoder(decoder: IImageDecoder): void {
    this.assertValidCodec(decoder);
    this.decoders.push(decoder);

    for (const ext of decoder.extensions) {
      const key = normalizeExtension(ext);
      this.assertNotRegistered(this.decoderByExt, key, "decoder", "extension", decoder);
      this.decoderByExt.set(key, decoder);
    }

    for (const mt of decoder.mimeTypes) {
      const key = normalizeMime(mt);
      this.assertNotRegistered(this.decoderByMime, key, "decoder", "mime", decoder);
      this.decoderByMime.set(key, decoder);
    }
  }

  registerEncoder(encoder: IImageEncoder): void {
    this.assertValidCodec(encoder);
    this.encoders.push(encoder);

    for (const ext of encoder.extensions) {
      const key = normalizeExtension(ext);
      this.assertNotRegistered(this.encoderByExt, key, "encoder", "extension", encoder);
      this.encoderByExt.set(key, encoder);
    }

    for (const mt of encoder.mimeTypes) {
      const key = normalizeMime(mt);
      this.assertNotRegistered(this.encoderByMime, key, "encoder", "mime", encoder);
      this.encoderByMime.set(key, encoder);
    }
  }

  tryGetDecoderByExtension(ext: FileExtension): IImageDecoder | undefined {
    return this.decoderByExt.get(normalizeExtension(ext));
  }

  tryGetDecoderByMimeType(mimeType: Mime): IImageDecoder | undefined {
    return this.decoderByMime.get(normalizeMime(mimeType));
  }

  tryGetEncoderByExtension(ext: FileExtension): IImageEncoder | undefined {
    return this.encoderByExt.get(normalizeExtension(ext));
  }

  tryGetEncoderByMimeType(mimeType: Mime): IImageEncoder | undefined {
    return this.encoderByMime.get(normalizeMime(mimeType));
  }

  listDecoders(): readonly IImageDecoder[] {
    return this.decoders.slice();
  }

  listEncoders(): readonly IImageEncoder[] {
    return this.encoders.slice();
  }

  private assertValidCodec(codec: CodecMeta): void {
    if (!codec.id || codec.id.trim().length === 0) {
      throw new CodecRegistrationError("Codec must have a non-empty id.");
    }
    if (!codec.mimeTypes || codec.mimeTypes.length === 0) {
      throw new CodecRegistrationError(`Codec '${codec.id}' must declare at least one mime type.`);
    }
    if (!codec.extensions || codec.extensions.length === 0) {
      throw new CodecRegistrationError(`Codec '${codec.id}' must declare at least one extension.`);
    }
  }

  private assertNotRegistered<TCodec extends { id: string }>(
    map: Map<string, TCodec>,
    key: string,
    kind: "decoder" | "encoder",
    by: "extension" | "mime",
    codec: TCodec
  ): void {
    const existing = map.get(key);
    if (!existing) return;

    throw new CodecRegistrationError(
      `Duplicate ${kind} registration by ${by} '${key}'. Existing codec '${existing.id}', attempted '${codec.id}'.`
    );
  }
}

// ============================================================================
// Resolver
// ============================================================================

export class ImageCodecResolver {
  constructor(private readonly registry: IImageCodecRegistry) {}

  decoderByExtensionOrThrow(ext: FileExtension): IImageDecoder {
    const d = this.registry.tryGetDecoderByExtension(ext);
    if (!d) throw new CodecNotFoundError(`No decoder registered for extension '${normalizeExtension(ext)}'.`);
    return d;
  }

  encoderByExtensionOrThrow(ext: FileExtension): IImageEncoder {
    const e = this.registry.tryGetEncoderByExtension(ext);
    if (!e) throw new CodecNotFoundError(`No encoder registered for extension '${normalizeExtension(ext)}'.`);
    return e;
  }

  decoderByMimeOrThrow(mime: Mime): IImageDecoder {
    const d = this.registry.tryGetDecoderByMimeType(mime);
    if (!d) throw new CodecNotFoundError(`No decoder registered for mime '${normalizeMime(mime)}'.`);
    return d;
  }

  encoderByMimeOrThrow(mime: Mime): IImageEncoder {
    const e = this.registry.tryGetEncoderByMimeType(mime);
    if (!e) throw new CodecNotFoundError(`No encoder registered for mime '${normalizeMime(mime)}'.`);
    return e;
  }
}

// ============================================================================
// Public surface (single-file replacement for index.ts)
// ============================================================================

export const __core_image_codec__ = true;