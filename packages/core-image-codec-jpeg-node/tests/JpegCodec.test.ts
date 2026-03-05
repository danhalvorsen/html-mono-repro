import { describe, it, expect } from "vitest";
import { JpegCodecFixture } from "./fixtures/JpegCodecFixture.js";

describe("@monorepo/core-image-codec-jpeg-node", () => {
  it("exposes decoder/encoder with stable id + mimeTypes + extensions", () => {
    const fx = new JpegCodecFixture();
    const { decoder, encoder } = fx.codec();

    expect(typeof decoder.id).toBe("string");
    expect(decoder.id.length).toBeGreaterThan(0);
    expect(Array.isArray(decoder.mimeTypes)).toBe(true);
    expect(decoder.mimeTypes.length).toBeGreaterThan(0);
    expect(Array.isArray(decoder.extensions)).toBe(true);
    expect(decoder.extensions.length).toBeGreaterThan(0);

    expect(typeof encoder.id).toBe("string");
    expect(encoder.id.length).toBeGreaterThan(0);
    expect(Array.isArray(encoder.mimeTypes)).toBe(true);
    expect(encoder.mimeTypes.length).toBeGreaterThan(0);
    expect(Array.isArray(encoder.extensions)).toBe(true);
    expect(encoder.extensions.length).toBeGreaterThan(0);

    const mts = [...decoder.mimeTypes, ...encoder.mimeTypes].map(x => String(x).toLowerCase());
    expect(mts.some(x => x === "image/jpeg" || x === "image/jpg")).toBe(true);

    const exts = [...decoder.extensions, ...encoder.extensions].map(x => String(x).toLowerCase().replace(/^\./, ""));
    expect(exts.some(x => x === "jpg" || x === "jpeg")).toBe(true);
  });

  it("can register into core-image-codec registry and resolve by extension/mimeType", () => {
    const fx = new JpegCodecFixture();
    const { registry, resolver, decoder, encoder } = fx.createRegistryWithCodec();

    const anyExt = decoder.extensions[0]!;
    expect(resolver.decoderByExtensionOrThrow(anyExt)).toBe(decoder);

    const anyMime = decoder.mimeTypes[0]!;
    expect(resolver.decoderByMimeOrThrow(anyMime)).toBe(decoder);

    const anyEncExt = encoder.extensions[0]!;
    expect(resolver.encoderByExtensionOrThrow(anyEncExt)).toBe(encoder);

    const anyEncMime = encoder.mimeTypes[0]!;
    expect(resolver.encoderByMimeOrThrow(anyEncMime)).toBe(encoder);

    expect(registry.listDecoders().length).toBe(1);
    expect(registry.listEncoders().length).toBe(1);
  });

  it("encode -> decode roundtrip preserves dimensions and approximates pixel colors (lossy)", async () => {
    const fx = new JpegCodecFixture();
    const { decoder, encoder } = fx.codec();

    const img = fx.create2x2RgbaImage();

    const bytes = await encoder.encode(img, { quality: 100, mimeType: "image/jpeg" });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(16);

    const decoded = await decoder.decode(bytes);

    expect(decoded.width).toBe(2);
    expect(decoded.height).toBe(2);

    fx.assertPixelClose(decoded.getPixel(0, 0), [255, 0, 0, 255]);
    fx.assertPixelClose(decoded.getPixel(1, 0), [0, 255, 0, 255]);
    fx.assertPixelClose(decoded.getPixel(0, 1), [0, 0, 255, 255]);
    fx.assertPixelClose(decoded.getPixel(1, 1), [255, 255, 255, 255]);
  });
});