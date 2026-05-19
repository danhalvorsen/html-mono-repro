import type { FilterType } from "./FilterType.js";

export class FilterSettings {
  private constructor(
    public readonly type: FilterType,
    public readonly frequency: number,
    public readonly q: number,
  ) {}

  public static create(
    type: FilterType,
    frequency: number,
    q: number,
  ): FilterSettings {
    if (frequency <= 0 || q <= 0) {
      throw new Error("Invalid filter");
    }

    return new FilterSettings(type, frequency, q);
  }
}
