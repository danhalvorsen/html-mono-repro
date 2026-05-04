import type { ITagTextNormalizer } from "./ITagTextNormalizer.js";

export class DefaultTagTextNormalizer implements ITagTextNormalizer {
  public normalize(value: string): string {
    return value.trim().replace(/\s+/gu, " ").toUpperCase();
  }
}