import type { INewPalette } from "./INewPalette.js";

export class NewPalette<TColor> implements INewPalette<TColor> {
  private readonly samples: readonly TColor[];

  private constructor(samples: readonly TColor[]) {
    this.samples = samples;
  }

  public static create<TColor>(samples: readonly TColor[]): NewPalette<TColor> {
    NewPalette.ensureNotEmpty(samples);
    return new NewPalette<TColor>([...samples]);
  }

  public get count(): number {
    return this.samples.length;
  }

  public getAt(index: number): TColor {
    NewPalette.ensureValidIndex(index, this.samples.length);

    const value = this.samples[index];

    if (value === undefined) {
      throw new Error(`Palette index '${index}' resolved to undefined.`);
    }

    return value;
  }

  public getAll(): readonly TColor[] {
    return [...this.samples];
  }

  private static ensureNotEmpty<TColor>(samples: readonly TColor[]): void {
    if (samples.length === 0) {
      throw new Error("Palette must contain at least one sample.");
    }
  }

  private static ensureValidIndex(index: number, length: number): void {
    if (!Number.isInteger(index)) {
      throw new Error(`Palette index must be an integer. Received '${index}'.`);
    }

    if (index < 0 || index >= length) {
      throw new Error(`Palette index '${index}' is out of range.`);
    }
  }
}