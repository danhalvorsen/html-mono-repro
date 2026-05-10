import sharp from "sharp";
import type {
  IRasterGraphicsNoiceStrategy,
  RasterGraphicsNoiceContext,
} from "../ports/IRasterGraphicsNoiceStrategy.js";

class DeterministicRandom {
  private state: number;

  public constructor(seed: number) {
    this.state = seed >>> 0;
  }

  public next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 0x100000000;
  }
}

export class NullRasterGraphicsNoiceStrategy implements IRasterGraphicsNoiceStrategy {
  public readonly name = "none";

  public async apply(context: RasterGraphicsNoiceContext): Promise<Buffer> {
    return context.image;
  }
}

export class RandomLinesRasterGraphicsNoiceStrategy implements IRasterGraphicsNoiceStrategy {
  public readonly name = "random-lines";

  public async apply(context: RasterGraphicsNoiceContext): Promise<Buffer> {
    const seed = this.readNumber(context.parameters, "seed", 1);
    const lineCount = this.readNumber(context.parameters, "lineCount", 4);
    const strokeWidth = this.readNumber(context.parameters, "strokeWidth", 1);
    const opacity = this.readNumber(context.parameters, "opacity", 0.15);
    const random = new DeterministicRandom(seed);
    const lines: string[] = [];

    for (let index = 0; index < lineCount; index += 1) {
      const x1 = Math.round(random.next() * context.width);
      const y1 = Math.round(random.next() * context.height);
      const x2 = Math.round(random.next() * context.width);
      const y2 = Math.round(random.next() * context.height);

      lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="${strokeWidth}" opacity="${opacity}" />`);
    }

    const overlay = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${context.width}" height="${context.height}" viewBox="0 0 ${context.width} ${context.height}">`,
      ...lines,
      "</svg>",
    ].join("");

    return sharp(context.image)
      .composite([{ input: Buffer.from(overlay) }])
      .png()
      .toBuffer();
  }

  private readNumber(parameters: Record<string, unknown>, name: string, fallback: number): number {
    const value = parameters[name];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return fallback;
    }

    return value;
  }
}