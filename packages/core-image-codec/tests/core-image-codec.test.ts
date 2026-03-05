// packages/core-image-codec/tests/core-image-codec.test.ts
import { describe, it, expect } from "vitest";

import {
  ImageCodecRegistry,
  ImageCodecResolver,
  CodecRegistrationError,
  CodecNotFoundError,
  normalizeExtension,
  normalizeMime,
  type IImageDecoder,
  type IImageEncoder,
  type Mime,
  type FileExtension,
  type CodecId,
} from '../src/main.js'

type AnyImage = any;

class DecoderStub implements IImageDecoder {
  constructor(
    public readonly id: CodecId,
    public readonly mimeTypes: readonly Mime[],
    public readonly extensions: readonly FileExtension[]
  ) {}
  async decode(_data: Uint8Array): Promise<AnyImage> {
    return { kind: "image" };
  }
}

class EncoderStub implements IImageEncoder {
  constructor(
    public readonly id: CodecId,
    public readonly mimeTypes: readonly Mime[],
    public readonly extensions: readonly FileExtension[]
  ) {}
  async encode(_image: AnyImage, _options?: unknown): Promise<Uint8Array> {
    return new Uint8Array([1, 2, 3]);
  }
}

describe("core-image-codec", () => {
  it("normalizeExtension lowercases and strips dot", () => {
    expect(normalizeExtension(".JPG")).toBe("jpg");
    expect(normalizeExtension("jpeg")).toBe("jpeg");
    expect(normalizeExtension("  .PnG ")).toBe("png");
  });

  it("normalizeMime lowercases and trims", () => {
    expect(normalizeMime(" Image/JPEG ")).toBe("image/jpeg");
    expect(normalizeMime("image/png")).toBe("image/png");
    expect(normalizeMime(undefined)).toBe("");
  });

  it("registerDecoder + lookup by extension/mime works", () => {
    const reg = new ImageCodecRegistry();
    const dec = new DecoderStub("jpeg-node", ["image/jpeg"], ["jpg", "jpeg"]);

    reg.registerDecoder(dec);

    expect(reg.tryGetDecoderByExtension("jpg")).toBe(dec);
    expect(reg.tryGetDecoderByExtension(".JPG")).toBe(dec);
    expect(reg.tryGetDecoderByMimeType("image/jpeg")).toBe(dec);
    expect(reg.tryGetDecoderByMimeType(" Image/JPEG ")).toBe(dec);
  });

  it("registerEncoder + lookup by extension/mime works", () => {
    const reg = new ImageCodecRegistry();
    const enc = new EncoderStub("jpeg-node", ["image/jpeg"], ["jpg", "jpeg"]);

    reg.registerEncoder(enc);

    expect(reg.tryGetEncoderByExtension("jpeg")).toBe(enc);
    expect(reg.tryGetEncoderByExtension(".JpG")).toBe(enc);
    expect(reg.tryGetEncoderByMimeType("image/jpeg")).toBe(enc);
  });

  it("listDecoders/listEncoders returns copies", () => {
    const reg = new ImageCodecRegistry();
    const dec = new DecoderStub("jpeg-node", ["image/jpeg"], ["jpg"]);
    const enc = new EncoderStub("jpeg-node", ["image/jpeg"], ["jpg"]);

    reg.registerDecoder(dec);
    reg.registerEncoder(enc);

    const decs = reg.listDecoders();
    const encs = reg.listEncoders();

    expect(decs).toEqual([dec]);
    expect(encs).toEqual([enc]);

    // defensive copy behavior
    (decs as IImageDecoder[]).push(new DecoderStub("x", ["x"], ["x"]));
    (encs as IImageEncoder[]).push(new EncoderStub("y", ["y"], ["y"]));

    expect(reg.listDecoders()).toEqual([dec]);
    expect(reg.listEncoders()).toEqual([enc]);
  });

  it("rejects empty id / missing mime / missing extension (decoder)", () => {
    const reg = new ImageCodecRegistry();

    expect(() => reg.registerDecoder(new DecoderStub("", ["image/jpeg"], ["jpg"])))
      .toThrow(CodecRegistrationError);

    expect(() => reg.registerDecoder(new DecoderStub("jpeg-node", [], ["jpg"])))
      .toThrow(CodecRegistrationError);

    expect(() => reg.registerDecoder(new DecoderStub("jpeg-node", ["image/jpeg"], [])))
      .toThrow(CodecRegistrationError);
  });

  it("rejects duplicate decoder registration by extension", () => {
    const reg = new ImageCodecRegistry();

    reg.registerDecoder(new DecoderStub("jpeg-a", ["image/jpeg"], ["jpg"]));

    expect(() => reg.registerDecoder(new DecoderStub("jpeg-b", ["image/jpeg"], ["JPG"])))
      .toThrow(CodecRegistrationError);
  });

  it("rejects duplicate decoder registration by mime", () => {
    const reg = new ImageCodecRegistry();

    reg.registerDecoder(new DecoderStub("jpeg-a", ["image/jpeg"], ["jpg"]));

    expect(() => reg.registerDecoder(new DecoderStub("jpeg-b", [" IMAGE/JPEG "], ["jpeg"])))
      .toThrow(CodecRegistrationError);
  });

  it("resolver throws CodecNotFoundError when missing", () => {
    const reg = new ImageCodecRegistry();
    const r = new ImageCodecResolver(reg);

    expect(() => r.decoderByExtensionOrThrow("jpg")).toThrow(CodecNotFoundError);
    expect(() => r.encoderByExtensionOrThrow("jpg")).toThrow(CodecNotFoundError);
    expect(() => r.decoderByMimeOrThrow("image/jpeg")).toThrow(CodecNotFoundError);
    expect(() => r.encoderByMimeOrThrow("image/jpeg")).toThrow(CodecNotFoundError);
  });

  it("resolver returns the same instance registered", () => {
    const reg = new ImageCodecRegistry();

    const dec = new DecoderStub("jpeg-node", ["image/jpeg"], ["jpg"]);
    const enc = new EncoderStub("jpeg-node", ["image/jpeg"], ["jpg"]);

    reg.registerDecoder(dec);
    reg.registerEncoder(enc);

    const r = new ImageCodecResolver(reg);

    expect(r.decoderByExtensionOrThrow(".JPG")).toBe(dec);
    expect(r.decoderByMimeOrThrow(" Image/JPEG ")).toBe(dec);

    expect(r.encoderByExtensionOrThrow("jpg")).toBe(enc);
    expect(r.encoderByMimeOrThrow("image/jpeg")).toBe(enc);
  });
});