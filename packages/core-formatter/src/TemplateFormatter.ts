import {
  IFormatter,
  ITemplate,
  TemplateFormattingErrorContext,
  TemplateFormatterOptions,
} from "./ITemplate.js";

const DEFAULT_MISSING_TEMPLATE_MESSAGE = "[template missing]";
const DEFAULT_ERROR_MESSAGE = "[failed to format template]";

export class TemplateFormatter<T extends Record<string, any> = Record<string, any>>
  implements IFormatter<T>
{
  constructor(private readonly options: TemplateFormatterOptions<T> = {}) {}

  format(model: T | undefined, template?: ITemplate<T>): string {
    if (!template) {
      return this.applySanitize(
        this.options.missingTemplateFallback ??
          this.options.fallback ??
          DEFAULT_MISSING_TEMPLATE_MESSAGE
      );
    }

    const normalizedModel = this.ensureModel(model);

    try {
      const rendered = template.render(normalizedModel);
      return this.applySanitize(rendered);
    } catch (error) {
      return this.handleError(error, template, normalizedModel);
    }
  }

  private ensureModel(model: T | undefined): T {
    if (model !== undefined && model !== null) {
      return model;
    }
    if (this.options.defaultModel !== undefined) {
      return this.options.defaultModel;
    }
    return {} as T;
  }

  private handleError(
    error: unknown,
    template: ITemplate<T>,
    model: T
  ): string {
    const context: TemplateFormattingErrorContext<T> = {
      model,
      template,
      error,
    };

    if (this.options.onError) {
      return this.applySanitize(this.options.onError(context));
    }

    return this.applySanitize(
      this.options.fallback ?? DEFAULT_ERROR_MESSAGE
    );
  }

  private applySanitize(value: string): string {
    if (this.options.sanitize) {
      return this.options.sanitize(value);
    }
    return value;
  }
}
