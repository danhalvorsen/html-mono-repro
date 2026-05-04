export interface IPidTagTextNormalizer {
  normalize(value: string): string;
}

export class PidTagTextNormalizer implements IPidTagTextNormalizer {
  public normalize(value: string): string {
    return value.trim().replace(/\s+/gu, " ").toUpperCase();
  }
}