import {
  STYLE_TOKENS,
  TYPOGRAPHY_TOKENS,
  StyleLibrary,
  StyleResolver,
  type IStyle,
  type IStyleReference,
} from "@monorepo/core-style-system";

const styleLibrary = new StyleLibrary(STYLE_TOKENS);
const styleResolver = new StyleResolver([styleLibrary]);

export function resolveTokenStyle(reference: Readonly<IStyleReference>): IStyle {
  return styleResolver.resolve(reference);
}

export function styleColorOr(
  value: string | undefined,
  fallback: string,
): string {
  return value ?? fallback;
}

export function styleNumberOr(
  value: number | undefined,
  fallback: number,
): number {
  return value ?? fallback;
}

export function getDesignSystemFontFamily(): string {
  return TYPOGRAPHY_TOKENS.fontFamily.ui;
}
