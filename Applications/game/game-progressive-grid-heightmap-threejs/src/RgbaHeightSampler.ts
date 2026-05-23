import type { IHeightSampler } from "./IHeightSampler.js";
import { LuminanceRgbaToHeightConverter } from "./LuminanceRgbaToHeightConverter.js";
import type { RgbaColor } from "./RgbaColor.js";
import type { RgbaHeightSamplerOptions } from "./RgbaHeightSamplerOptions.js";
import type { RgbaImageData } from "./RgbaImageData.js";
import type { UvCoordinate } from "./UvCoordinate.js";

export class RgbaHeightSampler implements IHeightSampler {
  private readonly imageData: RgbaImageData;
  private readonly converter: NonNullable<RgbaHeightSamplerOptions["converter"]>;
  private readonly flipY: boolean;

  public constructor(imageData: RgbaImageData, options: RgbaHeightSamplerOptions = {}) {
    this.assertImageData(imageData);

    this.imageData = imageData;
    this.converter = options.converter ?? new LuminanceRgbaToHeightConverter();
    this.flipY = options.flipY ?? true;
  }

  public sample(uv: UvCoordinate): number {
    const x = this.clamp01(uv.u) * (this.imageData.width - 1);
    const normalizedV = this.flipY ? 1 - this.clamp01(uv.v) : this.clamp01(uv.v);
    const y = normalizedV * (this.imageData.height - 1);

    const x0 = Math.floor(x);
    const x1 = Math.ceil(x);
    const y0 = Math.floor(y);
    const y1 = Math.ceil(y);

    const tx = x - x0;
    const ty = y - y0;

    const h00 = this.readHeightAt(x0, y0);
    const h10 = this.readHeightAt(x1, y0);
    const h01 = this.readHeightAt(x0, y1);
    const h11 = this.readHeightAt(x1, y1);

    return this.lerp(
      this.lerp(h00, h10, tx),
      this.lerp(h01, h11, tx),
      ty,
    );
  }

  private readHeightAt(x: number, y: number): number {
    const index = (y * this.imageData.width + x) * 4;

    const color: RgbaColor = {
      red: this.readByte(index),
      green: this.readByte(index + 1),
      blue: this.readByte(index + 2),
      alpha: this.readByte(index + 3),
    };

    return this.converter.convert(color);
  }

  private readByte(index: number): number {
    const value = this.imageData.data[index];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`Missing RGBA byte at index: ${index}`);
    }

    if (value < 0 || value > 255) {
      throw new Error(`RGBA byte value is outside [0, 255]: ${value}`);
    }

    return value;
  }

  private assertImageData(imageData: RgbaImageData): void {
    if (!Number.isInteger(imageData.width) || imageData.width < 1) {
      throw new Error("Heightmap image width must be a positive integer.");
    }

    if (!Number.isInteger(imageData.height) || imageData.height < 1) {
      throw new Error("Heightmap image height must be a positive integer.");
    }

    const minimumLength = imageData.width * imageData.height * 4;

    if (imageData.data.length < minimumLength) {
      throw new Error("Heightmap image data does not contain enough RGBA bytes.");
    }
  }

  private clamp01(value: number): number {
    if (!Number.isFinite(value)) {
      throw new Error(`UV coordinate must be finite: ${value}`);
    }

    return Math.min(1, Math.max(0, value));
  }

  private lerp(start: number, end: number, amount: number): number {
    return start + (end - start) * amount;
  }
}