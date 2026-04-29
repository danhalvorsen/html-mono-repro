import type { ITemplate as CoreTemplate } from "@monorepo/core-template";

export type ITemplate<T = Record<string, any>> = CoreTemplate<T>;

export interface IFormatter<T = Record<string, any>> {
  format(model: T | undefined, template?: ITemplate<T>): string;
}

export interface TemplateFormattingErrorContext<T = Record<string, any>> {
  template: ITemplate<T>;
  model: T;
  error: unknown;
}

export interface TemplateFormatterOptions<T = Record<string, any>> {
  /**
   * Value to return when formatting fails.
   */
  fallback?: string;
  /**
   * Value to return when the formatter is invoked without a template.
   */
  missingTemplateFallback?: string;
  /**
   * Sanitizer that can be used to post-process every string result.
   */
  sanitize?: (value: string) => string;
  /**
   * Custom hook that receives error context before a fallback value is returned.
   */
  onError?: (context: TemplateFormattingErrorContext<T>) => string;
  /**
   * Model that is used when `format` is invoked without a model.
   */
  defaultModel?: T;
}

