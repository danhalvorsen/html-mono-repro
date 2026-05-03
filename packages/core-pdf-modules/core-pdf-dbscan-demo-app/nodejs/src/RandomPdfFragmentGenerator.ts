import type { PdfFragment } from "@monorepo/core-pdf-domain";

export interface IRandomNumberGenerator {
  next(): number;
}

export class MathRandomNumberGenerator implements IRandomNumberGenerator {
  public next(): number {
    return Math.random();
  }
}

export interface RandomPdfFragmentGeneratorOptions {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly width?: number;
  readonly height?: number;
  readonly pageNumber?: number;
}

export class RandomPdfFragmentGenerator {
  private readonly width: number;
  private readonly height: number;
  private readonly pageNumber: number;

  public constructor(
    private readonly options: RandomPdfFragmentGeneratorOptions,
    private readonly random: IRandomNumberGenerator = new MathRandomNumberGenerator(),
  ) {
    this.validate(options);

    this.width = options.width ?? 1;
    this.height = options.height ?? 1;
    this.pageNumber = options.pageNumber ?? 1;
  }

  public next(): PdfFragment {
    return {
      kind: "rectangle",
      pageNumber: this.pageNumber,
      boundingBox: {
        position: {
          x: this.randomBetween(this.options.minX, this.options.maxX),
          y: this.randomBetween(this.options.minY, this.options.maxY),
        },
        width: this.width,
        height: this.height,
      },
    };
  }

  public many(count: number): readonly PdfFragment[] {
    if (!Number.isInteger(count) || count < 0) {
      throw new Error("count must be a non-negative integer.");
    }

    return Array.from({ length: count }, () => this.next());
  }

  private randomBetween(min: number, max: number): number {
    return min + this.random.next() * (max - min);
  }

  private validate(options: RandomPdfFragmentGeneratorOptions): void {
    if (options.minX > options.maxX) {
      throw new Error("minX must be <= maxX.");
    }

    if (options.minY > options.maxY) {
      throw new Error("minY must be <= maxY.");
    }

    if ((options.width ?? 1) <= 0) {
      throw new Error("width must be > 0.");
    }

    if ((options.height ?? 1) <= 0) {
      throw new Error("height must be > 0.");
    }

    if ((options.pageNumber ?? 1) < 1) {
      throw new Error("pageNumber must be >= 1.");
    }
  }
}