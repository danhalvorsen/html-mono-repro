// ====================================================================================
// FILE: src/gradients/Gradient.ts
// ====================================================================================

import { GradientStop } from "./GradientStop.js";

export interface IGradient {
  readonly name: string;
  readonly count: number;

  getAt(index: number): GradientStop;
  getAll(): readonly GradientStop[];
}

export class Gradient implements IGradient {
  private readonly gradientName: string;
  private readonly stops: readonly GradientStop[];

  private constructor(name: string, stops: readonly GradientStop[]) {
    this.gradientName = name;
    this.stops = stops;
  }

  public static create(stops: readonly GradientStop[], name: string = "gradient"): Gradient {
    Gradient.ensureNotEmpty(stops);

    const orderedStops = [...stops].sort((left, right) => left.position - right.position);

    Gradient.ensureUniquePositions(orderedStops);

    return new Gradient(Gradient.normalizeName(name), orderedStops);
  }

  public get name(): string {
    return this.gradientName;
  }

  public get count(): number {
    return this.stops.length;
  }

  public getAt(index: number): GradientStop {
    Gradient.ensureValidIndex(index, this.stops.length);

    const stop = this.stops[index];

    if (stop === undefined) {
      throw new Error(`Gradient stop at index '${index}' was undefined.`);
    }

    return stop;
  }

  public getAll(): readonly GradientStop[] {
    return [...this.stops];
  }

  private static ensureNotEmpty(stops: readonly GradientStop[]): void {
    if (stops.length === 0) {
      throw new Error("Gradient must contain at least one stop.");
    }
  }

  private static normalizeName(name: string): string {
    const normalized = name.trim();

    return normalized.length > 0 ? normalized : "gradient";
  }

  private static ensureUniquePositions(stops: readonly GradientStop[]): void {
    for (let index = 1; index < stops.length; index += 1) {
      const previous = stops[index - 1];
      const current = stops[index];

      if (previous === undefined || current === undefined) {
        throw new Error("Gradient contains an invalid stop sequence.");
      }

      if (previous.position === current.position) {
        throw new Error(
          `Gradient stop positions must be unique. Duplicate position '${current.position}'.`,
        );
      }
    }
  }

  private static ensureValidIndex(index: number, length: number): void {
    if (!Number.isInteger(index)) {
      throw new Error(`Gradient stop index must be an integer. Received '${index}'.`);
    }

    if (index < 0 || index >= length) {
      throw new Error(`Gradient stop index '${index}' is out of range.`);
    }
  }
}
