// packages/core-math-colors/src/colors/Color.ts

import type { IColor } from "./IColor.js";

export class Color implements IColor {
  private static readonly BYTE_MAX = 255;
  private static readonly EPSILON = 1e-10;

  public readonly red: number;
  public readonly green: number;
  public readonly blue: number;
  public readonly alpha: number;

  private constructor(
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ) {
    this.red = Color.ensureNormalized(red, "red");
    this.green = Color.ensureNormalized(green, "green");
    this.blue = Color.ensureNormalized(blue, "blue");
    this.alpha = Color.ensureNormalized(alpha, "alpha");
  }

  public static fromNormalized(
    red: number,
    green: number,
    blue: number,
    alpha: number = 1,
  ): Color {
    return new Color(red, green, blue, alpha);
  }

  public static fromRgbBytes(
    red: number,
    green: number,
    blue: number,
    alpha: number = 1,
  ): Color {
    return new Color(
      Color.byteToNormalized(red, "red"),
      Color.byteToNormalized(green, "green"),
      Color.byteToNormalized(blue, "blue"),
      Color.ensureNormalized(alpha, "alpha"),
    );
  }

  public static fromHex(hex: string): Color {
    if (!hex || typeof hex !== "string") {
      throw new Error("Hex color must be a non-empty string.");
    }

    const normalized = hex.trim();

    if (!normalized.startsWith("#")) {
      throw new Error(`Invalid hex color '${hex}'. Must start with '#'.`);
    }

    const value = normalized.slice(1);

    if (value.length === 6) {
      return Color.fromRgbBytes(
        parseInt(value.slice(0, 2), 16),
        parseInt(value.slice(2, 4), 16),
        parseInt(value.slice(4, 6), 16),
      );
    }

    if (value.length === 8) {
      return Color.fromRgbBytes(
        parseInt(value.slice(0, 2), 16),
        parseInt(value.slice(2, 4), 16),
        parseInt(value.slice(4, 6), 16),
        parseInt(value.slice(6, 8), 16) / Color.BYTE_MAX,
      );
    }

    throw new Error(
      `Invalid hex color '${hex}'. Expected '#RRGGBB' or '#RRGGBBAA'.`,
    );
  }

  public equals(other: IColor): boolean {
    return (
      this.red === other.red &&
      this.green === other.green &&
      this.blue === other.blue &&
      this.alpha === other.alpha
    );
  }

  public clone(): Color {
    return new Color(this.red, this.green, this.blue, this.alpha);
  }

  public toHexRgb(): string {
    return `#${Color.toHexByte(this.red)}${Color.toHexByte(this.green)}${Color.toHexByte(this.blue)}`;
  }

  public toHexRgba(): string {
    return `#${Color.toHexByte(this.red)}${Color.toHexByte(this.green)}${Color.toHexByte(this.blue)}${Color.toHexByte(this.alpha)}`;
  }

  public toCssRgb(): string {
    return `rgb(${Color.toByte(this.red)} ${Color.toByte(this.green)} ${Color.toByte(this.blue)})`;
  }

  public toCssRgba(): string {
    return `rgb(${Color.toByte(this.red)} ${Color.toByte(this.green)} ${Color.toByte(this.blue)} / ${Color.formatAlpha(this.alpha)})`;
  }

  private static ensureNormalized(value: number, name: string): number {
    if (!Number.isFinite(value)) {
      throw new Error(`Color component '${name}' must be finite. Received '${value}'.`);
    }

    if (value < 0 || value > 1) {
      throw new Error(`Color component '${name}' must be in range [0..1]. Received '${value}'.`);
    }

    return value;
  }

  private static byteToNormalized(value: number, name: string): number {
    if (!Number.isFinite(value)) {
      throw new Error(`Byte component '${name}' must be finite. Received '${value}'.`);
    }

    if (value < 0 || value > Color.BYTE_MAX) {
      throw new Error(`Byte component '${name}' must be in range [0..255]. Received '${value}'.`);
    }

    return value / Color.BYTE_MAX;
  }

  private static toByte(value: number): number {
    const stabilized = Color.stabilizeUnitInterval(value);
    const scaled = stabilized * Color.BYTE_MAX;

    return Math.round(scaled);
  }

  private static toHexByte(value: number): string {
    return Color.toByte(value).toString(16).padStart(2, "0").toUpperCase();
  }

  private static formatAlpha(value: number): string {
    return Number.parseFloat(value.toFixed(4)).toString();
  }

  private static stabilizeUnitInterval(value: number): number {
    if (Math.abs(value) <= Color.EPSILON) {
      return 0;
    }

    if (Math.abs(1 - value) <= Color.EPSILON) {
      return 1;
    }

    const byteScaled = value * Color.BYTE_MAX;
    const nearestByte = Math.round(byteScaled);

    if (Math.abs(byteScaled - nearestByte) <= Color.EPSILON) {
      return nearestByte / Color.BYTE_MAX;
    }

    return value;
  }
}