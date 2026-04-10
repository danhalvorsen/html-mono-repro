import { TYPOGRAPHY_TOKENS } from "@monorepo/core-style-system";

export class StyleValueHelpers {
  public static colorOr(value: string | undefined, fallback: string): string {
    return value ?? fallback;
  }

  public static numberOr(value: number | undefined, fallback: number): number {
    return value ?? fallback;
  }

  public static get designSystemFontFamily(): string {
    return TYPOGRAPHY_TOKENS.fontFamily.ui;
  }
}
