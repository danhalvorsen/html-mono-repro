import type { IRgbaToHeightConverter } from "./IRgbaToHeightConverter.js";
import type { RgbaColor } from "./RgbaColor.js";
import { RgbaChannel } from "./RgbaChannel.js";
import type { RgbaChannel as RgbaChannelValue } from "./RgbaChannel.js";

export class ChannelRgbaToHeightConverter implements IRgbaToHeightConverter {
  private readonly channel: RgbaChannelValue;

  public constructor(channel: RgbaChannelValue) {
    this.channel = channel;
  }

  public convert(color: RgbaColor): number {
    switch (this.channel) {
      case RgbaChannel.Red:
        return this.normalizeByte(color.red);

      case RgbaChannel.Green:
        return this.normalizeByte(color.green);

      case RgbaChannel.Blue:
        return this.normalizeByte(color.blue);

      case RgbaChannel.Alpha:
        return this.normalizeByte(color.alpha);
    }
  }

  private normalizeByte(value: number): number {
    if (!Number.isFinite(value) || value < 0 || value > 255) {
      throw new Error(`RGBA byte value is outside [0, 255]: ${value}`);
    }

    return value / 255;
  }
}