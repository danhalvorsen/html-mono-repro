import { describe, expect, it } from "vitest";
import {
  ChannelRgbaToHeightConverter,
  RgbaChannel,
  RgbaHeightSampler,
  type RgbaImageData,
} from "../src/index.js";

describe("RgbaHeightSampler", () => {
  function createImageData(): RgbaImageData {
    return {
      width: 2,
      height: 2,
      data: new Uint8ClampedArray([
        0, 0, 0, 255,
        255, 255, 255, 255,
        64, 64, 64, 255,
        128, 128, 128, 255,
      ]),
    };
  }

  it("samples bottom-left when flipY is enabled", () => {
    const sampler = new RgbaHeightSampler(createImageData(), {
      converter: new ChannelRgbaToHeightConverter(RgbaChannel.Red),
    });

    expect(sampler.sample({ u: 0, v: 0 })).toBeCloseTo(64 / 255);
  });

  it("samples top-right when flipY is enabled", () => {
    const sampler = new RgbaHeightSampler(createImageData(), {
      converter: new ChannelRgbaToHeightConverter(RgbaChannel.Red),
    });

    expect(sampler.sample({ u: 1, v: 1 })).toBeCloseTo(1);
  });

  it("bilinear samples the image center", () => {
    const sampler = new RgbaHeightSampler(createImageData(), {
      converter: new ChannelRgbaToHeightConverter(RgbaChannel.Red),
    });

    const expected = (0 + 255 + 64 + 128) / 4 / 255;

    expect(sampler.sample({ u: 0.5, v: 0.5 })).toBeCloseTo(expected);
  });

  it("rejects invalid image data", () => {
    expect(() => new RgbaHeightSampler({
      width: 2,
      height: 2,
      data: new Uint8ClampedArray(3),
    })).toThrow("Heightmap image data does not contain enough RGBA bytes.");
  });
});