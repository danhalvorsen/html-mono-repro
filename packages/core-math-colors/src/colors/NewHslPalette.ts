// packages/core-math-colors/src/colors/NewHslPalette.ts

import { HslColor } from "./HslColor.js";

export class NewHslPalette {
  private readonly samples: readonly HslColor[];

  private constructor(samples: readonly HslColor[]) {
    this.samples = samples;
  }

  public static create(samples: readonly HslColor[]): NewHslPalette {
    NewHslPalette.ensureNotEmpty(samples);
    return new NewHslPalette([...samples]);
  }

  public get count(): number {
    return this.samples.length;
  }

  public getAt(index: number): HslColor {
    NewHslPalette.ensureValidIndex(index, this.samples.length);

    const value = this.samples[index];

    if (value === undefined) {
      throw new Error(`Palette index '${index}' resolved to undefined.`);
    }

    return value;
  }

  public getAll(): readonly HslColor[] {
    return [...this.samples];
  }

  private static ensureNotEmpty(samples: readonly HslColor[]): void {
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