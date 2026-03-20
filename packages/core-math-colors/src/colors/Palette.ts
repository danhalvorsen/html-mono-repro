// ====================================================================================
// FILE: src/colors/Palette.ts
// ====================================================================================

import { Color } from "./Color.js";

export class Palette {
  private readonly samples: readonly Color[];

  private constructor(samples: readonly Color[]) {
    this.samples = samples;
  }

  public static create(samples: readonly Color[]): Palette {
    Palette.ensureNotEmpty(samples);
    return new Palette([...samples]);
  }

  public get count(): number {
    return this.samples.length;
  }

  public getAt(index: number): Color {
    Palette.ensureValidIndex(index, this.samples.length);

    const value = this.samples[index];

    if (value === undefined) {
      // Should never happen due to guard — keeps TS + runtime safe
      throw new Error(`Palette index '${index}' resolved to undefined.`);
    }

    return value;
  }

  public getAll(): readonly Color[] {
    return [...this.samples];
  }

  private static ensureNotEmpty(samples: readonly Color[]): void {
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